import { AuthService } from '../../services/auth/authService.js';
import axios from 'axios'; // Added for refreshGoogleToken
import upload from '../../middleware/uploadMiddleware.js';

export class AuthController {
    static async register(req, res) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { authProvider } = req.params;
            let result;
            if (authProvider === 'local') {
                result = await AuthService.login(req.body.email, req.body.password);
                // Set refresh token as HTTP-only cookie
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                const { accessToken, user } = result;
                res.status(200).json({ accessToken, user, success: true });
            } else if (authProvider === 'google') {
                // Build Google OAuth URL and return it
                const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
                const params = new URLSearchParams({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    redirect_uri: `${process.env.BACKEND_BASE_URL}/api/auth/google/callback`,
                    response_type: 'code',
                    scope: 'email profile',
                    access_type: 'offline',
                    prompt: 'consent'
                });
                const url = `${googleOAuthUrl}?${params.toString()}`;
                return res.status(200).json({ url });
            } else {
                return res.status(400).json({ error: 'Invalid auth provider' });
            }
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    static async googleCallback(req, res) {
        try {
            const { code } = req.query;
            const result = await AuthService.googleAuth(code);
            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            const { refreshToken, ...responseData } = result;
            res.status(200).json(responseData);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token not found' });
            }

            const result = await AuthService.refreshToken(refreshToken);

            // Set new refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Return only access token (not refresh token)
            const { refreshToken: newRefreshToken, ...responseData } = result;
            res.status(200).json(responseData);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async refreshGoogleToken(req, res) {
        const refreshToken = req.body.refresh_token;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token missing' });
        }

        try {
            const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            });

            const { access_token, expires_in } = tokenRes.data;

            // Optionally set new access token as cookie
            res.cookie('googleAccessToken', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: expires_in * 1000 || 1000 * 60 * 15, // fallback 15 min
                path: '/',
            });

            return res.json({
                access_token,
                expires_in,
            });
        } catch (error) {
            console.error('Token refresh error:', error.response?.data || error.message);
            res.status(500).send('Failed to refresh token');
        }
    }

    static async logout(req, res) {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Logged out successfully' });
    }

    static async getCurrentUser(req, res) {
        try {
            // User is already authenticated by middleware
            const userId = req.user.userId;
            console.log('userId', userId);
            const user = await AuthService.getUserById(userId);
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }



    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);
            res.status(200).json(result);
        } catch (error) {
            // Always return a generic error to prevent user enumeration
            return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.', success: true });
        }
    }

    static async verifyPasswordResetOTP(req, res) {
        try {
            const { email, otp } = req.body;
            const result = await AuthService.verifyPasswordResetOTP(email, otp);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email, tempToken, newPassword } = req.body;
            const result = await AuthService.resetPassword(email, tempToken, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
