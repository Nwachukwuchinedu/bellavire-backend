import express from 'express';
import { getPropertySummaries, getPropertyDetailById } from '../controllers/propertyController.js';
import Property from '../models/Property.js';

const router = express.Router();

/**
 * @swagger
 * /public/properties/summary:
 *   get:
 *     summary: Get a summary list of properties
 *     tags: [Property]
 *     description: Returns a list of properties with summary fields (no authentication required)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page (default 10)
 *     responses:
 *       200:
 *         description: List of property summaries
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
 *                 properties:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       propertyName:
 *                         type: string
 *                       propertyType:
 *                         type: array
 *                         items:
 *                           type: string
 *                       address:
 *                         type: string
 *                       frontImage:
 *                         type: string
 *                       bedrooms:
 *                         type: integer
 *                       ensuiteCount:
 *                         type: integer
 *                       amenities:
 *                         type: object
 *                         properties:
 *                           wifi:
 *                             type: boolean
 *                           electricity:
 *                             type: boolean
 *                           furnishedKitchen:
 *                             type: boolean
 *                           water:
 *                             type: boolean
 *                           gym:
 *                             type: boolean
 */
router.get('/properties/summary', getPropertySummaries);

/**
 * @swagger
 * /public/properties/details/{id}:
 *   get:
 *     summary: Get detailed property information by ID
 *     tags: [Property]
 *     description: Returns detailed information for a single property (no authentication required)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 propertyName:
 *                   type: string
 *                 description:
 *                   type: string
 *                 address:
 *                   type: string
 *                 billsIncluded:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [electricity, water, wifi]
 *                 bedrooms:
 *                   type: integer
 *                 bathrooms:
 *                   type: integer
 *                 facilities:
 *                   type: object
 *                   properties:
 *                     wifi:
 *                       type: boolean
 *                     electricity:
 *                       type: boolean
 *                     furnishedKitchen:
 *                       type: boolean
 *                     water:
 *                       type: boolean
 *                     gym:
 *                       type: boolean
 *                 landlord:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *       404:
 *         description: Property not found
 */
router.get('/properties/details/:id', getPropertyDetailById);

export default router;
