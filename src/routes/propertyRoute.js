import express from 'express';
import { getPropertySummaries } from '../controllers/propertyController.js';
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

export default router;
