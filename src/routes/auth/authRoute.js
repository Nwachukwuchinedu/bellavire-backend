import express from 'express';
import { AuthController } from '../../controllers/auth/authController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import upload from '../../middleware/uploadMiddleware.js';
import { verifyOTPController, resendOTPController } from '../../controllers/auth/otpController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */
// Registration route
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: [] # No authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - password

 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [agent, landlord, tenant]
 *                 default: tenant


 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 */
router.post('/register', AuthController.register);

// Login routes with auth provider parameter
/**
 * @swagger
 * /auth/login/{authProvider}:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     security: [] # No authentication required
 *     parameters:
 *       - in: path
 *         name: authProvider
 *         schema:
 *           type: string
 *           enum: [local, google]
 *         required: true
 *         description: Authentication provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Local authentication response
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                       description: User information
 *                     success:
 *                       type: boolean
 *                       example: true
 *                 - type: object
 *                   description: Google authentication response
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: Google OAuth URL for authentication
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie (for local auth)
 *             schema:
 *               type: string
 *       400:
 *         description: Validation error or invalid auth provider
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid auth provider"
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 */
router.post('/login/:authProvider', AuthController.login);

// Google OAuth routes
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     security: [] # No authentication required
 *     responses:
 *       200:
 *         description: Google authentication successful
 *       400:
 *         description: Google authentication failed
 */
router.get('/google/callback', AuthController.googleCallback);

/**
 * @swagger
 * /auth/google/refresh-token:
 *   post:
 *     summary: Refresh Google access token using Google refresh token
 *     tags: [Auth]
 *     security: [] # No authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Google refresh token
 *     responses:
 *       200:
 *         description: Google access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 expires_in:
 *                   type: integer
 *       400:
 *         description: Refresh token missing
 *       500:
 *         description: Failed to refresh token
 */
router.post('/google/refresh-token', AuthController.refreshGoogleToken);

// Token management routes
/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     security: [] # No authentication required (uses cookie)
 *     description: Uses refresh token from HTTP-only cookie
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Refresh token not found or invalid
 */
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     security: [] # No authentication required (clears cookie)
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post('/logout', AuthController.logout);

// User profile route
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);



/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid OTP or error
 */
router.post('/verify-otp', verifyOTPController);

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Error resending OTP
 */
router.post('/resend-otp', resendOTPController);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Start password reset (send OTP)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Error
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @swagger
 * /auth/verify-password-reset-otp:
 *   post:
 *     summary: Verify OTP for password reset and get temp token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified, temp token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tempToken:
 *                   type: string
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Error
 */
router.post('/verify-password-reset-otp', AuthController.verifyPasswordResetOTP);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using temp token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - tempToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               tempToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Error
 */
router.post('/reset-password', AuthController.resetPassword);



export default router;