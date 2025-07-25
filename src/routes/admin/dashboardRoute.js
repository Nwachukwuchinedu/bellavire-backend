import express from 'express';
import {getDashboardOverview } from '../../controllers/admin/dashboardController.js';

const router = express.Router();

/**
 * @swagger
 * /admin/dashboard/overview:
 *   get:
 *     summary: Get full admin dashboard overview (totals, properties, notifications, recent tenants)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Admin ID for notifications (optional)
 *     responses:
 *       200:
 *         description: Dashboard overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totals:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: integer
 *                     tenants:
 *                       type: integer
 *                     landlords:
 *                       type: integer
 *                     agents:
 *                       type: integer
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 recentTenants:
 *                   type: object
 *                   properties:
 *                     all:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tenant'
 *                     days30:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tenant'
 *                     days7:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tenant'
 *                     hours24:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tenant'
 */
router.get('/overview', getDashboardOverview);

export default router;
