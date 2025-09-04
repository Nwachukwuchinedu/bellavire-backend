import { updateAdminProfile, changeAdminPassword, getAdminProfile } from '../../services/admin/adminSettingsService.js';
import { uploads } from '../../utils/fileUtils.js';

/**
 * Get admin profile
 * @route GET /admin/settings/profile
 * @access Private (Admin)
 */
export const getProfile = async (req, res) => {
    try {
        const admin = await getAdminProfile(req.admin.adminId);
        res.json({
            status: true,
            data: admin,
            message: 'Profile retrieved successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

/**
 * Update admin profile
 * @route PUT /admin/settings/profile
 * @access Private (Admin)
 */
export const updateProfile = async (req, res) => {
    try {
        // Handle profile image upload if provided
        let updateData = { ...req.body };
        
        if (req.file) {
            try {
                const fileInfo = await uploads(
                    req.file.buffer,
                    req.file.originalname,
                    'admin'
                );
                updateData.profileImage = fileInfo.path;
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    message: `Failed to upload profile image: ${error.message}`
                });
            }
        }
        
        const admin = await updateAdminProfile(req.admin.adminId, updateData);
        res.json({
            status: true,
            data: admin,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};

/**
 * Change admin password
 * @route PUT /admin/settings/password
 * @access Private (Admin)
 */
export const changePassword = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                status: false,
                message: 'Password is required'
            });
        }
        
        await changeAdminPassword(req.admin.adminId, password);
        res.json({
            status: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message
        });
    }
};