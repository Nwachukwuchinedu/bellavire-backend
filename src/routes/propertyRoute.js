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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for property name, address, city, or description
 *       - in: query
 *         name: listingType
 *         schema:
 *           type: string
 *           enum: [to-buy, to-rent]
 *         description: Filter by listing type (to buy or to rent)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (city/town or address)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minBedrooms
 *         schema:
 *           type: integer
 *         description: Minimum number of bedrooms
 *       - in: query
 *         name: maxBedrooms
 *         schema:
 *           type: integer
 *         description: Maximum number of bedrooms
 *       - in: query
 *         name: userLat
 *         schema:
 *           type: number
 *         description: User's latitude for distance calculation
 *       - in: query
 *         name: userLng
 *         schema:
 *           type: number
 *         description: User's longitude for distance calculation
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
 *                       monthlyRent:
 *                         type: number
 *                       listingType:
 *                         type: string
 *                         enum: [to-buy, to-rent]
 *                       cityOrTown:
 *                         type: string
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
 *                       distance:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           driving:
 *                             type: object
 *                             properties:
 *                               distance:
 *                                 type: string
 *                                 description: Driving distance (e.g., "5.2 km")
 *                               duration:
 *                                 type: string
 *                                 description: Driving time (e.g., "12 mins")
 *                           walking:
 *                             type: object
 *                             properties:
 *                               distance:
 *                                 type: string
 *                                 description: Walking distance (e.g., "5.2 km")
 *                               duration:
 *                                 type: string
 *                                 description: Walking time (e.g., "45 mins")
 *                 filters:
 *                   type: object
 *                   properties:
 *                     search:
 *                       type: string
 *                       nullable: true
 *                     listingType:
 *                       type: string
 *                       nullable: true
 *                     location:
 *                       type: string
 *                       nullable: true
 *                     minPrice:
 *                       type: number
 *                       nullable: true
 *                     maxPrice:
 *                       type: number
 *                       nullable: true
 *                     minBedrooms:
 *                       type: integer
 *                       nullable: true
 *                     maxBedrooms:
 *                       type: integer
 *                       nullable: true
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
 *       - in: query
 *         name: userLat
 *         schema:
 *           type: number
 *         description: User's latitude for distance calculation
 *       - in: query
 *         name: userLng
 *         schema:
 *           type: number
 *         description: User's longitude for distance calculation
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
 *                 distance:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     driving:
 *                       type: object
 *                       properties:
 *                         distance:
 *                           type: string
 *                           description: Driving distance (e.g., "5.2 km")
 *                         duration:
 *                           type: string
 *                           description: Driving time (e.g., "12 mins")
 *                     walking:
 *                       type: object
 *                       properties:
 *                         distance:
 *                           type: string
 *                           description: Walking distance (e.g., "5.2 km")
 *                         duration:
 *                           type: string
 *                           description: Walking time (e.g., "45 mins")
 *       404:
 *         description: Property not found
 */
router.get('/properties/details/:id', getPropertyDetailById);

export default router;
