import express from 'express';
import { getUsers } from '../../controllers/admin/userManagementController.js';

const router = express.Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get a paginated, searchable, and filterable list of users
 *     tags: [Admin]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by first name, last name, or email (case-insensitive)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, landlord, tenant]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by user status (Active/Inactive)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created after this date (inclusive)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created before this date (inclusive)
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, landlord, tenant]
 *                       phoneNumber:
 *                         type: string
 *                       dateJoined:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [Active, Inactive]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// GET /admin/users - paginated, searchable, filterable user list
router.get('/', getUsers);

export default router;
