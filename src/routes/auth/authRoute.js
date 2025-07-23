import express from 'express';
import { AuthController } from '../../controllers/auth/authController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import upload from '../../middleware/uploadMiddleware.js';

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
 *               - entityType
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
 *                 enum: [admin, landlord, tenant]
 *                 default: tenant
 *               entityType:
 *                 type: string
 *                 enum: [individual, organization]
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
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
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

// Personal and Organization Information routes
/**
 * @swagger
 * /auth/personal-info:
 *   post:
 *     summary: Create personal (individual) information for a verified user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - postalCode
 *               - documentIssuedIdFile
 *             properties:
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               documentIssuedIdFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Personal information created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndividualInformation'
 *       400:
 *         description: Validation error or file missing
 *       401:
 *         description: Unauthorized
 */
router.post('/personal-info', authenticateToken, upload.single('documentIssuedIdFile'), AuthController.createPersonalInformation);

/**
 * @swagger
 * /auth/organization-info:
 *   post:
 *     summary: Create organization information for a verified user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - postalCode
 *               - documentIssuedIdFile
 *             properties:
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               documentIssuedIdFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Organization information created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationInformation'
 *       400:
 *         description: Validation error or file missing
 *       401:
 *         description: Unauthorized
 */
router.post('/organization-info', authenticateToken, upload.single('documentIssuedIdFile'), AuthController.createOrganizationInformation);

export default router;