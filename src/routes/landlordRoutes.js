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
  deleteProperty,
  searchProperties,
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenanceStatus,
  assignContractor,
  removeContractor,
  getAllLeases,
  getLeaseById,
  terminateLease,
  // Tour controllers
  getMyTours,
  getTourById,
  updateTourStatus,
  rescheduleTour,
  getTourCalendar
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
 * /landlords/search-properties:
 *   get:
 *     summary: Search properties with filters
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for property name, location, address, or postcode
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *       - in: query
 *         name: occupation
 *         schema:
 *           type: string
 *           enum: [occupied, vacant, all]
 *         description: Filter by occupation status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by availability date (YYYY-MM-DD)
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid filter parameters
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/search-properties", authenticateToken, requireLandlord, searchProperties);

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

/**
 * @swagger
 * /landlords/maintenances:
 *   get:
 *     summary: Get all maintenance requests for the landlord with summary statistics
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Maintenance requests retrieved successfully
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
 *                     maintenances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Maintenance'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: integer
 *                         requestsInProgress:
 *                           type: integer
 *                         pendingRequests:
 *                           type: integer
 *                         completedRequests:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/maintenances", authenticateToken, requireLandlord, getAllMaintenances);

/**
 * @swagger
 * /landlords/maintenances/{id}:
 *   get:
 *     summary: Get a specific maintenance request by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Maintenance request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Maintenance request or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/maintenances/:id", authenticateToken, requireLandlord, getMaintenanceById);

/**
 * @swagger
 * /landlords/maintenances/{id}:
 *   patch:
 *     summary: Update maintenance request status
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, in progress, pending, failed]
 *                 description: New status for the maintenance request
 *     responses:
 *       200:
 *         description: Maintenance request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance request or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/maintenances/:id", authenticateToken, requireLandlord, updateMaintenanceStatus);

/**
 * @swagger
 * /landlords/maintenances/{id}/assign-contractor:
 *   post:
 *     summary: Assign a contractor to a maintenance request
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - specialty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contractor's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contractor's email address
 *               phone:
 *                 type: string
 *                 description: Contractor's phone number
 *               specialty:
 *                 type: string
 *                 description: Contractor's area of specialty (e.g., plumbing, electrical, HVAC)
 *     responses:
 *       200:
 *         description: Contractor assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance request, contractor, or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.post("/maintenances/:id/assign-contractor", authenticateToken, requireLandlord, assignContractor);

/**
 * @swagger
 * /landlords/maintenances/{id}/remove-contractor:
 *   delete:
 *     summary: Remove contractor assignment from a maintenance request
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Contractor removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Maintenance request or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.delete("/maintenances/:id/remove-contractor", authenticateToken, requireLandlord, removeContractor);

/**
 * @swagger
 * /landlords/leases:
 *   get:
 *     summary: Get all leases for the landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lease'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/leases", authenticateToken, requireLandlord, getAllLeases);

/**
 * @swagger
 * /landlords/leases/{id}:
 *   get:
 *     summary: Get a specific lease by ID with detailed information
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     responses:
 *       200:
 *         description: Lease retrieved successfully with detailed tenant, property, and payment information
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
 *                     _id:
 *                       type: string
 *                       description: Lease ID
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       description: Lease start date
 *                     expirationDate:
 *                       type: string
 *                       format: date-time
 *                       description: Lease expiration date
 *                     duration:
 *                       type: string
 *                       description: Duration of the lease
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *                       description: Status of the lease
 *                     currentProperty:
 *                       type: string
 *                       description: Current property name
 *                     streetName:
 *                       type: string
 *                       description: Street name of the property
 *                     rent:
 *                       type: number
 *                       description: Rent amount per month
 *                     apartment:
 *                       type: string
 *                       description: Apartment number or name
 *                     city:
 *                       type: string
 *                       description: City
 *                     zipCode:
 *                       type: string
 *                       description: Zip code
 *                     leaseDocument:
 *                       type: string
 *                       description: Lease document file path
 *                     isTerminated:
 *                       type: boolean
 *                       description: Whether the lease has been terminated
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     tenantDetail:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Tenant ID
 *                         firstName:
 *                           type: string
 *                           description: Tenant first name
 *                         lastName:
 *                           type: string
 *                           description: Tenant last name
 *                         email:
 *                           type: string
 *                           description: Tenant email
 *                         phoneNumber:
 *                           type: string
 *                           description: Tenant phone number
 *                         address:
 *                           type: string
 *                           description: Tenant address
 *                         country:
 *                           type: string
 *                           description: Tenant country
 *                         city:
 *                           type: string
 *                           description: Tenant city
 *                         employmentStatus:
 *                           type: string
 *                           description: Tenant employment status
 *                         monthlyIncome:
 *                           type: number
 *                           description: Tenant monthly income
 *                         paymentHistory:
 *                           type: array
 *                           description: Payment history for this tenant and property
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Payment ID
 *                               description:
 *                                 type: string
 *                                 description: Payment description
 *                               amount:
 *                                 type: number
 *                                 description: Payment amount
 *                               dueDate:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Payment due date
 *                               transactionId:
 *                                 type: string
 *                                 description: Transaction ID
 *                               status:
 *                                 type: string
 *                                 enum: [paid, failed, outstanding, pending]
 *                                 description: Payment status
 *                               paymentMethod:
 *                                 type: string
 *                                 description: Payment method used
 *                               receipt:
 *                                 type: object
 *                                 description: Receipt details
 *                     propertyDetail:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Property ID
 *                         propertyName:
 *                           type: string
 *                           description: Property name
 *                         address:
 *                           type: string
 *                           description: Property address
 *                         monthlyRent:
 *                           type: number
 *                           description: Monthly rent amount
 *                         depositAmount:
 *                           type: number
 *                           description: Deposit amount
 *                         propertyType:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Property type
 *                         bedrooms:
 *                           type: number
 *                           description: Number of bedrooms
 *                         bathrooms:
 *                           type: number
 *                           description: Number of bathrooms
 *                     landlordDetail:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Landlord ID
 *                         firstName:
 *                           type: string
 *                           description: Landlord first name
 *                         lastName:
 *                           type: string
 *                           description: Landlord last name
 *                         email:
 *                           type: string
 *                           description: Landlord email
 *                         phoneNumber:
 *                           type: string
 *                           description: Landlord phone number
 *                         address:
 *                           type: string
 *                           description: Landlord address
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Lease or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/leases/:id", authenticateToken, requireLandlord, getLeaseById);

/**
 * @swagger
 * /landlords/leases/{id}/terminate:
 *   patch:
 *     summary: Terminate a lease
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for termination
 *               comment:
 *                 type: string
 *                 description: Additional comments
 *     responses:
 *       200:
 *         description: Lease terminated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Lease'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Lease or landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/leases/:id/terminate", authenticateToken, requireLandlord, terminateLease);

// ==================== TOUR ROUTES ====================

/**
 * @swagger
 * /landlords/tours:
 *   get:
 *     summary: Get landlord's tours
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, declined, cancelled, completed]
 *         description: Filter by tour status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tours from this date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tours until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Tours retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
landlordRouter.get("/tours", authenticateToken, requireLandlord, getMyTours);

/**
 * @swagger
 * /landlords/tours/calendar:
 *   get:
 *     summary: Get landlord calendar
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for calendar (YYYY-MM-DD). If not provided, defaults to first day of current month
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for calendar (YYYY-MM-DD). If not provided, defaults to last day of current month
 *     responses:
 *       200:
 *         description: Calendar data retrieved successfully
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
 *                     calendarData:
 *                       type: object
 *                       description: Tours grouped by date
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                         isDefault:
 *                           type: boolean
 *                           description: Whether default date range was used
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
landlordRouter.get("/tours/calendar", authenticateToken, requireLandlord, getTourCalendar);

/**
 * @swagger
 * /landlords/tours/{tourId}:
 *   get:
 *     summary: Get tour by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Tour retrieved successfully
 *       404:
 *         description: Tour not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
landlordRouter.get("/tours/:tourId", authenticateToken, requireLandlord, getTourById);

/**
 * @swagger
 * /landlords/tours/{tourId}/status:
 *   patch:
 *     summary: Update tour status
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, declined, cancelled, completed]
 *                 description: New status for the tour
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes
 *           example:
 *             status: "confirmed"
 *             notes: "Looking forward to showing you the property"
 *     responses:
 *       200:
 *         description: Tour status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
landlordRouter.patch("/tours/:tourId/status", authenticateToken, requireLandlord, updateTourStatus);

/**
 * @swagger
 * /landlords/tours/{tourId}/reschedule:
 *   patch:
 *     summary: Reschedule tour
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - timeSlot
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: New date for the tour (YYYY-MM-DD)
 *               timeSlot:
 *                 type: string
 *                 enum: [09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00]
 *                 description: New time slot for the tour
 *           example:
 *             date: "2024-07-16"
 *             timeSlot: "15:00"
 *     responses:
 *       200:
 *         description: Tour rescheduled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
landlordRouter.patch("/tours/:tourId/reschedule", authenticateToken, requireLandlord, rescheduleTour);

export default landlordRouter 