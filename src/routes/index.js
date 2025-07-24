/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 */
import express from 'express';
import authRoutes from './auth/authRoute.js';
import propertyRoutes from './propertyRoute.js';
import newsLetterRoutes from './newsLetterRoute.js';
import contactUsRoute from './contactUsRoute.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', propertyRoutes);
router.use('/', newsLetterRoutes);
router.use('/', contactUsRoute);

export default router;
