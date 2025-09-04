import Admin from '../../models/Admin.js';
import bcrypt from 'bcryptjs';
import validator from '../../validation/dynamicValidateAndSanitize.js';

/**
 * Update admin profile information
 * @param {string} adminId - Admin ID
 * @param {Object} updateData - Profile data to update
 * @returns {Promise<Object>} Updated admin object
 */
export const updateAdminProfile = async (adminId, updateData) => {
    try {
        // Validate the update data against the Admin model
        const { value, error } = validator.validateForUpdate(updateData, Admin, {
            excludeFields: ['password', 'role', 'email'], // Exclude fields that shouldn't be updated here
            joiOptions: {
                stripUnknown: true
            }
        });

        if (error) {
            throw new Error(error.details.map(e => e.message).join(', '));
        }

        // Update the admin profile
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: value },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedAdmin) {
            throw new Error('Admin not found');
        }

        return updatedAdmin;
    } catch (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }
};

/**
 * Change admin password
 * @param {string} adminId - Admin ID
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const changeAdminPassword = async (adminId, newPassword) => {
    try {
        // Validate password (basic validation)
        if (!newPassword || newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedAdmin) {
            throw new Error('Admin not found');
        }

        return { message: 'Password updated successfully' };
    } catch (error) {
        throw new Error(`Failed to change password: ${error.message}`);
    }
};

/**
 * Get admin profile
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Admin object without password
 */
export const getAdminProfile = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId).select('-password');
        if (!admin) {
            throw new Error('Admin not found');
        }
        return admin;
    } catch (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`);
    }
};