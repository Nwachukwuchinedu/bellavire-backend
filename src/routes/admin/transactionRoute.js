import express from 'express';
import { getTransactions, getTransactionAnalytics } from '../../controllers/admin/transactionController.js';
import { authenticateAdminToken } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Get paginated transactions with search and filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of transactions per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by transaction ID, tenant name, or property name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, successful, failed]
 *           default: all
 *         description: Filter by transaction status
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, 30days, 7days, 24hours]
 *           default: all
 *         description: Filter by time period
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           transactionId:
 *                             type: string
 *                             example: "TXN_123456789"
 *                           tenantName:
 *                             type: string
 *                             example: "John Doe"
 *                           tenantProfileImage:
 *                             type: string
 *                             example: "https://example.com/profile.jpg"
 *                           propertyName:
 *                             type: string
 *                             example: "Sunset Apartments"
 *                           amount:
 *                             type: number
 *                             example: 850.00
 *                           paymentDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                           status:
 *                             type: string
 *                             enum: [pending, successful, failed]
 *                             example: "successful"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 15
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 message:
 *                   type: string
 *                   example: "Transactions retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAdminToken, getTransactions);

/**
 * @swagger
 * /admin/transactions/analytics:
 *   get:
 *     summary: Get transaction analytics and metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalVolume:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 125000.00
 *                         percentageChange:
 *                           type: number
 *                           example: 15.5
 *                         trend:
 *                           type: string
 *                           enum: [increase, decrease, no_change]
 *                           example: "increase"
 *                     pendingTransactions:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 25
 *                         amount:
 *                           type: number
 *                           example: 18750.00
 *                         yesterdayCount:
 *                           type: integer
 *                           example: 5
 *                         yesterdayAmount:
 *                           type: number
 *                           example: 3750.00
 *                     failedTransactions:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 8
 *                     averageCompletionTime:
 *                       type: object
 *                       properties:
 *                         hours:
 *                           type: number
 *                           example: 2.5
 *                         percentageChange:
 *                           type: number
 *                           example: -10.2
 *                         trend:
 *                           type: string
 *                           enum: [faster, slower, no_change]
 *                           example: "faster"
 *                 message:
 *                   type: string
 *                   example: "Transaction analytics retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/analytics', authenticateAdminToken, getTransactionAnalytics);

export default router;
