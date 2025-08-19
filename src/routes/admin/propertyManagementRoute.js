import express from 'express';
import { getProperties, getPropertyDetails } from '../../controllers/admin/propertyManagementController.js';
import { authenticateAdminToken } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /admin/properties:
 *   get:
 *     summary: Get paginated properties with search and filters
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
 *         description: Number of properties per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by address, property name, owner name, or agent name
 *       - in: query
 *         name: cityOrTown
 *         schema:
 *           type: string
 *         description: Filter by city or town
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [all, flat, shared, detached-house, semi-detached]
 *           default: all
 *         description: Filter by property type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, occupied, vacant, pending]
 *           default: all
 *         description: Filter by property status
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateAdminToken, getProperties);

/**
 * @swagger
 * /admin/properties/{propertyId}/details:
 *   get:
 *     summary: Get detailed property information
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.get('/:propertyId/details', authenticateAdminToken, getPropertyDetails);

export default router;
