import express from "express"
import { authenticateToken, requireLandlord } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getCurrentLandlord,
  updateLandlord,
  getNotificationSettings,
  updateNotificationSettings,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from "../controllers/landlordController.js";

/**
 * @swagger
 * tags:
 *   - name: Landlords
 *     description: Landlord management and operations
 */

const landlordRouter = express.Router()

/**
 * @swagger
 * /landlords/profile:
 *   get:
 *     summary: Get current landlord profile
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Landlord profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Landlord'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
landlordRouter.get("/profile", authenticateToken, requireLandlord, getCurrentLandlord);

/**
 * @swagger
 * /landlords/profile:
 *   patch:
 *     summary: Update current landlord profile
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Landlord profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Landlord'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: array
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/profile", authenticateToken, requireLandlord, updateLandlord);

/**
 * @swagger
 * /landlords/notification-settings:
 *   get:
 *     summary: Get landlord notification settings
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Notification settings object
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/notification-settings", authenticateToken, requireLandlord, getNotificationSettings);

/**
 * @swagger
 * /landlords/notification-settings:
 *   patch:
 *     summary: Update landlord notification settings
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationSettings:
 *                 type: object
 *                 description: Notification settings to update
 *                 properties:
 *                   security:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   newLease:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [instantly, 2min, 5min, 10min, never]
 *                   rentalApplication:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [instantly, 2min, 5min, 10min, never]
 *                   onlinePaymentMade:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   onlinePaymentInitiate:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   onlinePaymentFailed:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   onlinePaymentSuccessful:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   taskAssigned:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   connectionUpdate:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   listingsInquiries:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   newMessages:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportSend:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportUpdate:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportCancelled:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportReady:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   invoicePosted:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   invoiceOverdue:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [instantly, 2min, 5min, 10min, never]
 *                   invoiceDue:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   lease:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [60days_before, 30days_before, day_of_expiration, never]
 *                   maintenanceNewRequest:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   maintenanceChange:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   maintenanceMessage:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   maintenanceResolve:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   textMessage:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Updated notification settings
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/notification-settings", authenticateToken, requireLandlord, updateNotificationSettings);

/**
 * @swagger
 * /landlords/properties:
 *   get:
 *     summary: Get all properties for the landlord with summary statistics
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalProperties:
 *                           type: integer
 *                         totalRooms:
 *                           type: integer
 *                         occupiedRooms:
 *                           type: integer
 *                         vacantRooms:
 *                           type: integer
 *                         totalMonthlyRent:
 *                           type: number
 *                         averageMonthlyRent:
 *                           type: number
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/properties", authenticateToken, requireLandlord, getAllProperties);

/**
 * @swagger
 * /landlords/properties/{id}:
 *   get:
 *     summary: Get a specific property by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/properties/:id", authenticateToken, requireLandlord, getPropertyById);

/**
 * @swagger
 * /landlords/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - propertyName
 *               - propertyType
 *               - address
 *               - frontImage
 *               - bedrooms
 *               - bathrooms
 *               - monthlyRent
 *               - depositAmount
 *               - tenancy
 *               - availableFrom
 *               - paymentFrequency
 *               - addressLine1
 *               - cityOrTown
 *               - postalCode
 *               - regionOrCountry
 *             properties:
 *               propertyName:
 *                 type: string
 *               propertyType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [flat, shared, detached-house, semi-detached]
 *               address:
 *                 type: string
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               description:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               furnished:
 *                 type: boolean
 *               wifi:
 *                 type: boolean
 *               electricity:
 *                 type: boolean
 *               furnishedKitchen:
 *                 type: boolean
 *               water:
 *                 type: boolean
 *               gym:
 *                 type: boolean
 *               sharedAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [living room, bathroom, kitchen, dining room]
 *               billsIncluded:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [electricity, water, wifi]
 *               monthlyRent:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               tenancy:
 *                 type: string
 *                 enum: [monthly, annually]
 *               availableFrom:
 *                 type: string
 *                 format: date
 *               paymentFrequency:
 *                 type: string
 *                 enum: [monthly, weekly, annually]
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               cityOrTown:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               regionOrCountry:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error or file upload error
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.post("/properties", authenticateToken, requireLandlord, upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'propertyImages', maxCount: 10 }
]), createProperty);

/**
 * @swagger
 * /landlords/properties/{id}:
 *   patch:
 *     summary: Update a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               propertyName:
 *                 type: string
 *               propertyType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [flat, shared, detached-house, semi-detached]
 *               address:
 *                 type: string
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               description:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               furnished:
 *                 type: boolean
 *               wifi:
 *                 type: boolean
 *               electricity:
 *                 type: boolean
 *               furnishedKitchen:
 *                 type: boolean
 *               water:
 *                 type: boolean
 *               gym:
 *                 type: boolean
 *               sharedAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [living room, bathroom, kitchen, dining room]
 *               billsIncluded:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [electricity, water, wifi]
 *               monthlyRent:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               tenancy:
 *                 type: string
 *                 enum: [monthly, annually]
 *               availableFrom:
 *                 type: string
 *                 format: date
 *               paymentFrequency:
 *                 type: string
 *                 enum: [monthly, weekly, annually]
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               cityOrTown:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               regionOrCountry:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error or file upload error
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/properties/:id", authenticateToken, requireLandlord, upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'propertyImages', maxCount: 10 }
]), updateProperty);

/**
 * @swagger
 * /landlords/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.delete("/properties/:id", authenticateToken, requireLandlord, deleteProperty);

export default landlordRouter 