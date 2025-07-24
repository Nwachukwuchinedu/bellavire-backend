/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 */
import express from 'express';
import authRoutes from './auth/authRoute.js';
import tenantRoutes from './tenantRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);

export default router;
