import express from 'express';
import userManagementRoute from './userManagementRoute.js';
import dashboardRoute from './dashboardRoute.js';
import adminAuthRoute from './adminAuthRoute.js';

const router = express.Router();

router.use('/dashboard', dashboardRoute);
router.use('/users', userManagementRoute);
router.use('/auth', adminAuthRoute);

export default router;
