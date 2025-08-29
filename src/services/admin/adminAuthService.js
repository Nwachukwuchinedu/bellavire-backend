import Admin from '../../models/Admin.js';
import AdminRegistrationToken from '../../models/AdminRegistrationToken.js';
import jwt from 'jsonwebtoken';
import validator from '../../validation/dynamicValidateAndSanitize.js';
import { jwtConfig } from '../../config/jwtConfig.js';
import crypto from 'crypto';
import { sendEmail } from '../emailService.js';
import { adminRegistrationTokenTemplate } from '../../templates/adminToken.js';

export class AdminAuthService {
    // Generate JWT token for admin
    static generateToken(adminId) {
        return jwt.sign({ adminId }, jwtConfig.JWT_ACCESS_SECRET, { expiresIn: jwtConfig.JWT_ACCESS_EXPIRES_IN });
    }

    // Generate refresh token for admin
    static generateRefreshToken(adminId) {
        return jwt.sign({ adminId, type: 'refresh' }, jwtConfig.JWT_REFRESH_SECRET, { expiresIn: jwtConfig.JWT_REFRESH_EXPIRES_IN });
    }

    // Generate one-time registration token
    static generateRegistrationToken(email, generatedBy) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        return new AdminRegistrationToken({
            token,
            email,
            generatedBy,
            expiresAt
        });
    }

    // Verify JWT token
    static verifyToken(token) {
        try {
            return jwt.verify(token, jwtConfig.JWT_ACCESS_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Register new admin
    static async register(adminData) {
        console.log('Admin registration data received:', adminData);

        // Clear schema cache to ensure we get the latest schema
        validator.schemaCache.clear();

        // Validate and sanitize input
        const { value, error } = validator.validateForCreate(adminData, Admin, {
            joiOptions: {
                allowUnknown: true,
                stripUnknown: true
            }
        });

        if (error) {
            console.log('Validation error details:', error.details);
            throw new Error(error.details.map(e => e.message).join(', '));
        }

        console.log('Validation passed, sanitized data:', value);
        const { firstName, lastName, email, phoneNumber, password, role } = value;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }

        // Create new admin
        const admin = new Admin({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            role: role || 'admin'
        });

        await admin.save();

        return {
            id: admin._id,
            message: 'Admin registered successfully',
            success: true
        };
    }

    // Register admin with token
    static async registerWithToken(adminData, registrationToken) {
        console.log('Admin registration with token data received:', adminData);

        // Validate registration token
        const tokenDoc = await AdminRegistrationToken.findOne({ token: registrationToken });
        if (!tokenDoc) {
            throw new Error('Invalid registration token');
        }

        if (!tokenDoc.isValid()) {
            throw new Error('Registration token has expired or already been used');
        }

        // Check if email matches token
        if (tokenDoc.email.toLowerCase() !== adminData.email.toLowerCase()) {
            throw new Error('Email does not match the registration token');
        }

        // Clear schema cache to ensure we get the latest schema
        validator.schemaCache.clear();

        // Add role to adminData before validation (hardcoded to 'admin')
        const adminDataWithRole = {
            ...adminData,
            role: 'admin'
        };

        // Validate and sanitize input
        const { value, error } = validator.validateForCreate(adminDataWithRole, Admin, {
            joiOptions: {
                allowUnknown: true,
                stripUnknown: true
            }
        });

        if (error) {
            console.log('Validation error details:', error.details);
            throw new Error(error.details.map(e => e.message).join(', '));
        }

        console.log('Validation passed, sanitized data:', value);
        const { firstName, lastName, email, phoneNumber, password } = value;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }

        // Create new admin (role will be 'admin' for token-based registration)
        const admin = new Admin({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            role: 'admin' // Token-based registration always creates admin role
        });

        await admin.save();

        // Mark token as used
        await tokenDoc.markAsUsed();

        return {
            id: admin._id,
            message: 'Admin registered successfully with token',
            success: true
        };
    }

    // Generate registration token (only for owners)
    static async generateRegistrationTokenForEmail(email, ownerId) {
        // Verify the requester is an owner
        const owner = await Admin.findById(ownerId);
        if (!owner || owner.role !== 'owner') {
            throw new Error('Only owners can generate registration tokens');
        }

        // Check if admin already exists with this email
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            throw new Error('Admin with this email already exists');
        }

        // Check if token already exists for this email
        const existingToken = await AdminRegistrationToken.findOne({
            email,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });
        if (existingToken) {
            throw new Error('A valid registration token already exists for this email');
        }

        // Generate new token
        const tokenDoc = this.generateRegistrationToken(email, ownerId);
        await tokenDoc.save();

        // Send email with token
        const registrationUrl = process.env.ADMIN_REGISTRATION_URL || 'http://localhost:3000/admin/register';
        const html = adminRegistrationTokenTemplate({
            firstName: '',
            lastName: '',
            token: tokenDoc.token,
            expiresAt: tokenDoc.expiresAt,
            generatedBy: {
                firstName: owner.firstName || '',
                lastName: owner.lastName || '',
                email: owner.email
            },
            registrationUrl
        });

        await sendEmail({
            to: email,
            subject: 'Your Admin Registration Token',
            html
        });

        return {
            token: tokenDoc.token,
            email: tokenDoc.email,
            expiresAt: tokenDoc.expiresAt,
            message: 'Registration token generated and emailed successfully'
        };
    }

    // Admin login
    static async login(email, password) {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate tokens
        const accessToken = this.generateToken(admin._id);
        const refreshToken = this.generateRefreshToken(admin._id);

        return {
            admin: admin.toJSON(),
            accessToken,
            refreshToken
        };
    }

    // Refresh token for admin
    static async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        try {
            const decoded = jwt.verify(refreshToken, jwtConfig.JWT_REFRESH_SECRET);

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }

            const admin = await Admin.findById(decoded.adminId);
            if (!admin) {
                throw new Error('Admin not found');
            }

            const newAccessToken = this.generateToken(admin._id);
            const newRefreshToken = this.generateRefreshToken(admin._id);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid refresh token');
            }
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }
            throw error;
        }
    }

    // Get admin by ID
    static async getAdminById(adminId) {
        if (!adminId) {
            throw new Error('Admin ID is required');
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }
        return admin.toJSON();
    }

    // Change admin password
    static async changePassword(adminId, currentPassword, newPassword) {
        if (!adminId || !currentPassword || !newPassword) {
            throw new Error('Admin ID, current password, and new password are required');
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            throw new Error('Admin not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        return {
            message: 'Password changed successfully',
            success: true
        };
    }
} 