import { AdminAuthService } from '../../services/admin/adminAuthService.js';

export class AdminAuthController {
    static async register(req, res) {
        try {
            const result = await AdminAuthService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error('Admin registration error:', error);
            res.status(400).json({
                error: error.message,
                success: false
            });
        }
    }

    static async registerWithToken(req, res) {
        try {
            const { token, ...adminData } = req.body;

            if (!token) {
                return res.status(400).json({
                    error: 'Registration token is required',
                    success: false
                });
            }

            const result = await AdminAuthService.registerWithToken(adminData, token);
            res.status(201).json(result);
        } catch (error) {
            console.error('Admin registration with token error:', error);
            res.status(400).json({
                error: error.message,
                success: false
            });
        }
    }

    static async generateRegistrationToken(req, res) {
        try {
            const { email } = req.body;
            const ownerId = req.admin.adminId; // From middleware

            if (!email) {
                return res.status(400).json({
                    error: 'Email is required',
                    success: false
                });
            }

            const result = await AdminAuthService.generateRegistrationTokenForEmail(email, ownerId);
            res.status(200).json({
                ...result,
                success: true
            });
        } catch (error) {
            console.error('Generate registration token error:', error);
            res.status(400).json({
                error: error.message,
                success: false
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required',
                    success: false
                });
            }

            const result = await AdminAuthService.login(email, password);

            // Set refresh token as HTTP-only cookie
            res.cookie('adminRefreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const { accessToken } = result;
            res.status(200).json({
                accessToken,
                success: true
            });
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(401).json({
                error: error.message,
                success: false
            });
        }
    }

    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.adminRefreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    error: 'Refresh token not found',
                    success: false
                });
            }

            const result = await AdminAuthService.refreshToken(refreshToken);

            // Set new refresh token as HTTP-only cookie
            res.cookie('adminRefreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Return only access token (not refresh token)
            const { refreshToken: newRefreshToken, ...responseData } = result;
            res.status(200).json({
                ...responseData,
                success: true
            });
        } catch (error) {
            console.error('Admin token refresh error:', error);
            res.status(401).json({
                error: error.message,
                success: false
            });
        }
    }

    static async logout(req, res) {
        try {
            // Clear admin refresh token cookie
            res.clearCookie('adminRefreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            res.status(200).json({
                message: 'Admin logged out successfully',
                success: true
            });
        } catch (error) {
            console.error('Admin logout error:', error);
            res.status(500).json({
                error: 'Logout failed',
                success: false
            });
        }
    }

    static async getCurrentAdmin(req, res) {
        try {
            // Admin is already authenticated by middleware
            const adminId = req.admin.adminId;
            const admin = await AdminAuthService.getAdminById(adminId);
            res.status(200).json({
                admin,
                success: true
            });
        } catch (error) {
            console.error('Get current admin error:', error);
            res.status(401).json({
                error: error.message,
                success: false
            });
        }
    }

    static async changePassword(req, res) {
        try {
            const adminId = req.admin.adminId;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Current password and new password are required',
                    success: false
                });
            }

            const result = await AdminAuthService.changePassword(adminId, currentPassword, newPassword);
            res.status(200).json(result);
        } catch (error) {
            console.error('Change password error:', error);
            res.status(400).json({
                error: error.message,
                success: false
            });
        }
    }
} 