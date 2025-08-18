/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 *   - name: Tenants
 *     description: Tenant management and operations
 *   - name: Landlords
 *     description: Landlord management and operations
 *   - name: Admin Transactions
 *     description: Admin transaction management and analytics
 */
import express from 'express';
import authRoutes from './auth/authRoute.js';
import propertyRoutes from './propertyRoute.js';
import newsLetterRoutes from './newsLetterRoute.js';
import tenantRoutes from './tenantRoutes.js';
import landlordRoutes from './landlordRoutes.js';
import contactUsRoute from './contactUsRoute.js';
import adminRoutes from './admin/admin.js';
import tenantChatRoute from './chatRoute.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', propertyRoutes);
router.use('/', newsLetterRoutes);
router.use('/tenants', tenantRoutes);
router.use('/landlords', landlordRoutes);
router.use('/', contactUsRoute);
router.use('/admin', adminRoutes);
router.use('/chat', tenantChatRoute);

export default router;
