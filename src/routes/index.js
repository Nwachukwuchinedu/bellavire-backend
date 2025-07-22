/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 */
import express from 'express';
import authRoutes from './auth/authRoute.js';

const router = express.Router();

router.use('/auth', authRoutes);

export default router;
