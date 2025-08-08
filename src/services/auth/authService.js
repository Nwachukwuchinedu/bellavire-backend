import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Admin from '../../models/Admin.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import validator from '../../validation/dynamicValidateAndSanitize.js';
import PersonalInformation from '../../models/IndividualInformation.js';
import OrganizationInformation from '../../models/OrganizationInformation.js';
import { uploads } from '../../utils/fileUtils.js';
import { sendVerificationOTP, sendPasswordResetOTP, verifyPasswordResetOTP } from '../../utils/handleOTP.js';
import getPasswordResetSuccessTemplate from '../../templates/passwordReset.js';
import { sendEmail } from '../../services/emailService.js';

import { jwtConfig } from '../../config/jwtConfig.js';

export class AuthService {
    // Generate JWT token
    static generateToken(userId) {
        return jwt.sign({ userId }, jwtConfig.JWT_ACCESS_SECRET, { expiresIn: jwtConfig.JWT_ACCESS_EXPIRES_IN });
    }

    // Generate refresh token
    static generateRefreshToken(userId) {
        return jwt.sign({ userId, type: 'refresh' }, jwtConfig.JWT_REFRESH_SECRET, { expiresIn: jwtConfig.JWT_REFRESH_EXPIRES_IN });
    }

    // Verify JWT token
    static verifyToken(token) {
        try {
            return jwt.verify(token, jwtConfig.JWT_ACCESS_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Register new user
    static async register(userData) {
        console.log('Registration data received:', userData);

        // Clear schema cache to ensure we get the latest schema
        validator.schemaCache.clear();

        // Validate and sanitize input - exclude authProvider as it's set automatically
        const { value, error } = validator.validateForCreate(userData, User, {
            excludeFields: ['authProvider'],
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
        const { email, password, firstName, lastName, phoneNumber, role = 'tenant', entityType = 'individual' } = value;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            role,
            authProvider: 'local',
            isEmailVerified: false,
            isActive: true,
            entityType
        });

        await user.save();

        // Send OTP email for verification
        await sendVerificationOTP({ user, email: user.email });

        // Create role-specific data based on user role
        let roleData = null;
        try {
            switch (role) {
                case 'tenant':
                    roleData = await this.createTenantData(user, userData);
                    break;
                case 'landlord':
                    roleData = await this.createLandlordData(user, userData);
                    break;
                case 'admin':
                    roleData = await this.createAdminData(user, userData);
                    break;
                default:
                    throw new Error('Invalid role specified');
            }
        } catch (roleError) {
            // If role-specific data creation fails, delete the user and throw error
            await User.findByIdAndDelete(user._id);
            throw new Error(`Failed to create ${role} data: ${roleError.message}`);
        }

        return {
            id: user._id,
            message: 'User registered successfully, please check your email for verification',
            success: true
        };
    }

    // Local login
    static async login(email, password) {
        // Validate and sanitize input
        const { value, error } = validator.validateForUpdate({ email, password }, User, { excludeFields: [] });
        if (error) {
            throw new Error(error.details.map(e => e.message).join(', '));
        }
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Check if user uses local authentication
        if (user.authProvider !== 'local') {
            throw new Error(`This email is registered with ${user.authProvider}. Please use the appropriate login method.`);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        await user.updateLastLogin();

        // Generate tokens
        const accessToken = this.generateToken(user._id);
        const refreshToken = this.generateRefreshToken(user._id);

        return {
            user: user.toJSON(),
            accessToken,
            refreshToken
        };
    }

    // Google OAuth login
    static async googleAuth(code) {
        try {
            // Exchange code for tokens
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                redirect_uri: `${process.env.BACKEND_BASE_URL}/api/auth/google/callback`,
                grant_type: 'authorization_code'
            });

            const { access_token, refresh_token, expires_in } = tokenResponse.data;

            // Get user profile from Google
            const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            const { id: googleId, email, given_name, family_name } = profileResponse.data;

            // Find or create user
            let user = await User.findOne({ email });

            if (user && user.authProvider === 'local') {
                throw new Error('This email is already registered with a password. Please log in using email and password.');
            }

            if (!user) {
                // Create new user
                user = new User({
                    firstName: given_name,
                    lastName: family_name,
                    email,
                    phoneNumber: '', // Google doesn't provide phone number
                    authProvider: 'google',
                    googleId,
                    isEmailVerified: true, // Google accounts are pre-verified
                    isActive: true
                });
            } else {
                // Update existing Google user
                user.googleId = googleId;
                user.isEmailVerified = true;
                user.isActive = true;
            }

            await user.updateLastLogin();
            await user.save();

            // Generate JWT tokens for your app
            // const jwtAccessToken = this.generateToken(user._id);
            // const jwtRefreshToken = this.generateRefreshToken(user._id);

            return {
                user: user.toJSON(),
                // accessToken: jwtAccessToken,
                // refreshToken: jwtRefreshToken,
                googleAccessToken: access_token,
                //googleRefreshToken: refresh_token,
                googleExpiresIn: expires_in
            };
        } catch (error) {
            throw new Error(`Google authentication failed: ${error.message}`);
        }
    }

    // Refresh token
    static async refreshToken(refreshToken) {
        // Validate and sanitize input
        const { value, error } = validator.validateForCreate({ refreshToken }, User, { excludeFields: [] });
        if (error) {
            throw new Error(error.details.map(e => e.message).join(', '));
        }
        try {
            const decoded = jwt.verify(refreshToken, jwtConfig.JWT_REFRESH_SECRET);

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }

            const user = await User.findById(decoded.userId);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            const newAccessToken = this.generateToken(user._id);
            const newRefreshToken = this.generateRefreshToken(user._id);

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    // Get user by ID
    static async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user.toJSON();
    }

    // OTP verification
    static async verifyUserOTP(userId, otp) {
        // Throws if invalid
        await import('../../utils/handleOTP.js').then(({ verifyOTP }) => verifyOTP(userId, otp));
        // Set user as verified
        await User.findByIdAndUpdate(userId, { isEmailVerified: true });
        return true;
    }

    // Resend OTP
    static async resendUserOTP(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (user.isEmailVerified) throw new Error('Email already verified');
        await sendVerificationOTP({ user, email: user.email });
        return true;
    }

    static async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (user) {
            await sendPasswordResetOTP(user);
        }
        return { message: 'If an account with that email exists, an OTP has been sent.', success: true };
    }

    static async verifyPasswordResetOTP(email, otp) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid OTP or email');
        }
        const tempToken = await verifyPasswordResetOTP(user._id, otp);
        return { tempToken, message: 'OTP verified, use this token to reset password', success: true };
    }

    static async resetPassword(email, tempToken, newPassword) {
        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');
        const PasswordReset = (await import('../../models/PasswordReset.js')).default;
        const resetDoc = await PasswordReset.findOne({ user: user._id, token: tempToken });
        if (!resetDoc || resetDoc.expires < new Date()) {
            throw new Error('Invalid or expired password reset token');
        }
        user.password = newPassword;
        await user.save();
        await PasswordReset.deleteOne({ _id: resetDoc._id });
        // Send password reset success email (do not block response)
        sendEmail({
            to: user.email,
            subject: 'Your password has been reset',
            html: getPasswordResetSuccessTemplate({ name: user.firstName || user.lastName || user.email })
        });
        return { message: 'Password reset successful', success: true };
    }

    // Create tenant data
    static async createTenantData(user, userData) {
        const tenantData = {
            user: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            country: userData.country || '',
            city: userData.city || '',
            religion: userData.religion || '',
            gender: userData.gender || 'prefer_not_to_say',
            maritalStatus: userData.maritalStatus || 'single',
            numberOfChildren: userData.numberOfChildren || 0,
            employmentStatus: userData.employmentStatus,
            monthlyIncome: userData.monthlyIncome || 0,
            employer: userData.employer || '',
            address: userData.address || '',
            preferredLanguage: userData.preferredLanguage || 'english'
        };

        const tenant = new Tenant(tenantData);
        await tenant.save();
        return tenant.toJSON();
    }

    // Create landlord data
    static async createLandlordData(user, userData) {
        const landlordData = {
            user: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            country: userData.country || '',
            city: userData.city || '',
            address: userData.address || ''
        };

        const landlord = new Landlord(landlordData);
        await landlord.save();
        return landlord.toJSON();
    }

    // Create admin data
    static async createAdminData(user, userData) {
        const adminData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            department: userData.department || 'General',
            permissions: userData.permissions || ['read', 'write']
        };

        const admin = new Admin(adminData);
        await admin.save();
        return admin.toJSON();
    }

    // Create personal information for individual
    static async createPersonalInformation(user, infoData, file) {
        if (!user || user.entityType !== 'individual') {
            throw new Error('User must be an individual');
        }
        if (!user.isEmailVerified) {
            console.log('Email must be verified before creating personal information', user);
            throw new Error('Email must be verified before creating personal information');
        }
        // Prevent duplicate
        const existing = await PersonalInformation.findOne({ user: user.userId });
        if (existing) {
            throw new Error('Personal information has already been created for this user');
        }
        if (!file) {
            throw new Error('File is required');
        }
        // Upload file
        const fileInfo = await uploads(file.buffer, file.originalname, 'personal');
        const personalInfo = new PersonalInformation({
            user: user.userId,
            address: infoData.address,
            postalCode: infoData.postalCode,
            documentIssuedIdFile: fileInfo
        });
        await personalInfo.save();
        // Set user flag
        await User.findByIdAndUpdate(user.userId, { hasCreatedPersonalInformationOrOrganizationInformation: true });
        return personalInfo.toJSON();
    }

    // Create organization information for organization
    static async createOrganizationInformation(user, infoData, file) {
        if (!user || user.entityType !== 'organization') {
            throw new Error('User must be an organization');
        }
        if (!user.isEmailVerified) {
            throw new Error('Email must be verified before creating organization information');
        }
        // Prevent duplicate
        const existing = await OrganizationInformation.findOne({ user: user.userId });
        if (existing) {
            throw new Error('Organization information has already been created for this user');
        }
        if (!file) {
            throw new Error('File is required');
        }
        // Upload file
        const fileInfo = await uploads(file.buffer, file.originalname, 'organization');
        const orgInfo = new OrganizationInformation({
            user: user.userId,
            address: infoData.address,
            postalCode: infoData.postalCode,
            documentIssuedIdFile: fileInfo
        });
        await orgInfo.save();
        // Set user flag
        await User.findByIdAndUpdate(user.userId, { hasCreatedPersonalInformationOrOrganizationInformation: true });
        return orgInfo.toJSON();
    }
}
