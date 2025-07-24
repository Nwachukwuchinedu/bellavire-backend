/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 */
import express from 'express';
import authRoutes from './auth/authRoute.js';
import propertyRoutes from './propertyRoute.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', propertyRoutes);

export default router;
