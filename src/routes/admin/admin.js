import express from 'express';
import userManagementRoute from './userManagementRoute.js';
import dashboardRoute from './dashboardRoute.js';

const router = express.Router();

router.use('/dashboard', dashboardRoute);
router.use('/users', userManagementRoute);

export default router;
