/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 *   - name: Tenants
 *     description: Tenant management and operations
 */
import express from 'express';
import authRoutes from './auth/authRoute.js';
import propertyRoutes from './propertyRoute.js';
import newsLetterRoutes from './newsLetterRoute.js';
import tenantRoutes from './tenantRoutes.js';
import contactUsRoute from './contactUsRoute.js';
import adminRoutes from './admin/dashboardRoute.js';
// import chatRoute from './chatRoute.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', propertyRoutes);
router.use('/', newsLetterRoutes);
router.use('/tenants', tenantRoutes);
router.use('/', contactUsRoute);
router.use('/admin', adminRoutes);
// router.use('/chat', chatRoute);

export default router;
