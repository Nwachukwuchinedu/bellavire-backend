import express from 'express';
import { getDashboardOverview } from '../../controllers/admin/dashboardController.js';
import { authenticateAdminToken } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /admin/dashboard/overview:
 *   get:
 *     summary: Get full admin dashboard overview (totals, properties, notifications, recent tenants)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/overview', authenticateAdminToken, getDashboardOverview);

export default router;
