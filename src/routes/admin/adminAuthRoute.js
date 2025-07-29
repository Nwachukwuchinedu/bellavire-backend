import express from 'express';
import { AdminAuthController } from '../../controllers/admin/adminAuthController.js';
import { authenticateAdminToken } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin Authentication
 *     description: Admin authentication and authorization
 */

/**
 * @swagger
 * /admin/auth/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin Authentication]
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
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.post('/register', AdminAuthController.register);

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *                 accessToken:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.post('/login', AdminAuthController.login);

/**
 * @swagger
 * /admin/auth/refresh:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Authentication]
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
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.post('/refresh', AdminAuthController.refreshToken);

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Logout failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.post('/logout', authenticateAdminToken, AdminAuthController.logout);

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     summary: Get current admin information
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current admin information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.get('/me', authenticateAdminToken, AdminAuthController.getCurrentAdmin);

/**
 * @swagger
 * /admin/auth/change-password:
 *   post:
 *     summary: Change admin password
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.post('/change-password', authenticateAdminToken, AdminAuthController.changePassword);

export default router; 