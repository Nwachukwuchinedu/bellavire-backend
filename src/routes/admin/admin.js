import express from 'express';
import userManagementRoute from './userManagementRoute.js';
import dashboardRoute from './dashboardRoute.js';
import adminAuthRoute from './adminAuthRoute.js';
import transactionRoute from './transactionRoute.js';

const router = express.Router();

router.use('/dashboard', dashboardRoute);
router.use('/users', userManagementRoute);
router.use('/auth', adminAuthRoute);
router.use('/transactions', transactionRoute);

export default router;
