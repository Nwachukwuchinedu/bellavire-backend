import express from "express"
import { authenticateToken, requireTenant } from "../middleware/authMiddleware.js";
import {
  // Tenant controllers
  updateTenant,
  // Tenant field patch controllers
  updateLeaseSetting,
  updateNotifications,
  // Payment method controllers
  makePayment,
  // Saved properties controllers
  getSavedProperties,
  addSavedProperty,
  removeSavedProperty,
  // Maintenance controllers
  createMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  getMaintenanceDetails,
  updateMaintenanceById,
  deleteMaintenanceById,

  // New lease flow controllers
  getAvailableRooms,
  getLeaseDetails,
  terminateLease,

  // Tenant payment controllers
  getAllTenantPayments,
  getTenantPaymentById,
  // updateTenantPaymentById, // Disabled for audit trail integrity
  deleteTenantPaymentById,
  // Payment summary controllers
  getAllPaymentSummaries,
  getPaymentSummaryById,
  createPaymentSummary,
  updatePaymentSummaryById,
  deletePaymentSummaryById,
  // Tour controllers
  requestTour,
  getMyTours,
  getTourById,
  cancelTour,
  rescheduleTour,
  getAvailableTimeSlots,
  // Notification controllers
  getTenantNotifications,
  markNotificationAsReadById,
  markAllNotificationsAsReadForTenant,
  getUnreadNotificationCountForTenant,
  contactBuyerAgent,
  // Application controllers
  startApplication,
  getMyApplications,
  getApplicationById,
  cancelApplication,
  // Rental history controllers
  createRentalHistory,
  getAllRentalHistory,
  getRentalHistoryById,
  updateRentalHistory,
  deleteRentalHistory
} from "../controllers/tenantController.js";

import {
  sendMessage,
  getChatHistory,
  getChatHistoryPaginated,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount
} from "../controllers/chatController.js";
import upload from "../middleware/uploadMiddleware.js";

/**
 * @swagger
 * tags:
 *   - name: Tenants
 *     description: Tenant management and operations
 */

const tenantRouter = express.Router()

/**
 * @swagger
 * /tenants:
 *   patch:
 *     summary: Update current tenant profile
 *     tags: [Tenants]
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
 *               religion:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer_not_to_say]
 *               maritalStatus:
 *                 type: string
 *                 enum: [single, married, divorced, widowed, separated]
 *               numberOfChildren:
 *                 type: number
 *               address:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *                 enum: [english, french, german]
 *               employmentInfo:
 *                 type: object
 *                 properties:
 *                   employerName:
 *                     type: string
 *                   occupation:
 *                     type: string
 *                   monthlyIncome:
 *                     type: number
 *                   employmentDuration:
 *                     type: string
 *                   employmentStatus:
 *                     type: string
 *                     enum: [full_time, part_time, self_employed, student, employed, unemployed]
 *               backgroundCheck:
 *                 type: object
 *                 properties:
 *                   criminalRecords:
 *                     type: boolean
 *                   evictionHistory:
 *                     type: boolean
 *                   creditScore:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 850
 *                   creditScoreRange:
 *                     type: string
 *                     enum: [excellent, good, fair, poor]
 *               submittedDocuments:
 *                 type: object
 *                 properties:
 *                   validId:
 *                     type: string
 *                   utilityBill:
 *                     type: string
 *                   bankStatement:
 *                     type: string
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *                 message:
 *                   type: string
 */

tenantRouter.patch("/", authenticateToken, requireTenant, updateTenant);


/**
 * @swagger
 * /tenants/notification-settings:
 *   patch:
 *     summary: Update notification settings for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 $ref: '#/components/schemas/Tenant/properties/notifications'
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 */
tenantRouter.patch("/notification-settings", authenticateToken, requireTenant, updateNotifications);


/**
 * @swagger
 * /tenants/make-payment:
 *   post:
 *     summary: Make a payment using Paystack
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in NGN
 *               email:
 *                 type: string
 *                 description: Customer email
 *               description:
 *                 type: string
 *                 description: Payment description
 *               propertyId:
 *                 type: string
 *                 description: Property ID
 *     responses:
 *       200:
 *         description: Payment initialized successfully
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
 *                     authorizationUrl:
 *                       type: string
 *                     reference:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     paymentId:
 *                       type: string
 *                 message:
 *                   type: string
 */
tenantRouter.post("/make-payment", authenticateToken, requireTenant, makePayment);

/**
 * @swagger
 * /tenants/payment-callback:
 *   get:
 *     summary: Handle Paystack payment callback
 *     tags: [Tenants]
 *     security: [] # No authentication required for callback
 *     parameters:
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         description: Payment reference from Paystack
 *       - in: query
 *         name: trxref
 *         schema:
 *           type: string
 *         description: Transaction reference from Paystack
 *     responses:
 *       200:
 *         description: Payment callback handled successfully
 */
tenantRouter.get("/payment-callback", (req, res) => {
  const { reference, trxref } = req.query;
  const paymentRef = reference || trxref;
  const frontendUrl = process.env.FRONTEND_URL;

  if (paymentRef) {
    // Redirect to payment success page with reference
    res.redirect(`${frontendUrl}/payment-success.html?reference=${paymentRef}`);
  } else {
    // Redirect to payment failed page
    res.redirect(`${frontendUrl}/payment-failed.html`);
  }
});

/**
 * @swagger
 * /tenants/saved-properties:
 *   get:
 *     summary: Get all saved properties for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved properties retrieved successfully
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
 *                     properties:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                             description: Monthly rent amount
 *                             example: 1200
 *                           paymentFrequency:
 *                             type: string
 *                             description: Payment frequency
 *                             example: "monthly"
 *                           frontImage:
 *                             type: string
 *                             description: Property front image URL
 *                             example: "https://example.com/front-image.jpg"
 *                           propertyName:
 *                             type: string
 *                             description: Property name
 *                             example: "Modern Shared Flat"
 *                           address:
 *                             type: string
 *                             description: Property address
 *                             example: "123 Main St, London, UK"
 *                           bedroom:
 *                             type: number
 *                             description: Number of bedrooms
 *                             example: 3
 *                           propertyType:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Property types
 *                             example: ["flat", "shared"]
 *                           amenities:
 *                             type: object
 *                             properties:
 *                               wifi:
 *                                 type: boolean
 *                                 example: true
 *                               electricity:
 *                                 type: boolean
 *                                 example: true
 *                               furnishedKitchen:
 *                                 type: boolean
 *                                 example: true
 *                               water:
 *                                 type: boolean
 *                                 example: true
 *                               gym:
 *                                 type: boolean
 *                                 example: false
 *                             description: Available amenities
 *                     numberOfSavedProperties:
 *                       type: number
 *                       description: Total number of saved properties
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: "Saved properties retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Server error
 */
tenantRouter.get("/saved-properties", authenticateToken, requireTenant, getSavedProperties);

/**
 * @swagger
 * /tenants/saved-properties:
 *   post:
 *     summary: Add a property to saved properties for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property added to saved properties successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Property added to saved properties successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     propertyId:
 *                       type: string
 *                       description: Property ID
 *                     amount:
 *                       type: number
 *                       description: Monthly rent amount
 *                     paymentFrequency:
 *                       type: string
 *                       description: Payment frequency
 *                     frontImage:
 *                       type: string
 *                       description: Property front image URL
 *                     propertyName:
 *                       type: string
 *                       description: Property name
 *                     address:
 *                       type: string
 *                       description: Property address
 *                     bedroom:
 *                       type: number
 *                       description: Number of bedrooms
 *                     propertyType:
 *                       type: string
 *                       description: Type of property
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of amenities
 */
tenantRouter.post("/saved-properties", authenticateToken, requireTenant, addSavedProperty);

/**
 * @swagger
 * /tenants/saved-properties/{id}:
 *   delete:
 *     summary: Remove a property from saved properties for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property removed from saved properties successfully
 */
tenantRouter.delete("/saved-properties/:id", authenticateToken, requireTenant, removeSavedProperty);

/**
 * @swagger
 * /tenants/maintenances:
 *   post:
 *     summary: Create a new maintenance request for current tenant
 *     description: Create a new maintenance request. Property ID and Landlord ID must be provided in the request body. Status is automatically set to 'pending'.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - issue
 *               - category
 *               - landlord
 *               - property
 *             properties:
 *               issue:
 *                 type: string
 *                 example: "The kitchen faucet is leaking."
 *                 description: Short issue summary
 *               category:
 *                 type: string
 *                 example: "plumbing"
 *                 description: Category of the maintenance
 *               description:
 *                 type: string
 *                 example: "The faucet in the kitchen has been leaking for two days."
 *                 description: Detailed description
 *               status:
 *                 type: string
 *                 enum: [resolved, in progress, pending]
 *                 default: pending
 *                 description: Status of the maintenance request
 *               landlord:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ce"
 *                 description: Landlord ObjectId
 *               property:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cf"
 *                 description: Property ObjectId
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files (no limit)
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
 */
tenantRouter.post(
  "/maintenances",
  authenticateToken,
  requireTenant,
  upload.array('images'),
  createMaintenance
);

/**
 * @swagger
 * /tenants/maintenances/{id}:
 *   get:
 *     summary: Get a maintenance request by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance request retrieved successfully
 */
tenantRouter.get("/maintenances/:id", authenticateToken, requireTenant, getMaintenanceById);

/**
 * @swagger
 * /tenants/maintenances/{id}/details:
 *   get:
 *     summary: Get detailed maintenance information with tenant and property info
 *     tags: [Tenants]
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
 *         description: Maintenance details retrieved successfully
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
 *                     issue:
 *                       type: string
 *                       description: The maintenance issue
 *                     tenantAndPropertyInfo:
 *                       type: object
 *                       properties:
 *                         propertyAddress:
 *                           type: string
 *                           description: Address of the property
 *                         tenantName:
 *                           type: string
 *                           description: Full name of the tenant
 *                         tenantPhoneNumber:
 *                           type: string
 *                           description: Phone number of the tenant
 *                         tenantEmail:
 *                           type: string
 *                           description: Email of the tenant
 *                     requestDetails:
 *                       type: object
 *                       properties:
 *                         dateSubmitted:
 *                           type: string
 *                           format: date-time
 *                           description: Date when the request was submitted
 *                         issue:
 *                           type: string
 *                           description: The maintenance issue
 *                         description:
 *                           type: string
 *                           description: Detailed description of the issue
 *                         images:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Array of image URLs
 *                 message:
 *                   type: string
 *       404:
 *         description: Maintenance request not found or unauthorized
 *       500:
 *         description: Server error
 */
tenantRouter.get("/maintenances/:id/details", authenticateToken, requireTenant, getMaintenanceDetails);

/**
 * @swagger
 * /tenants/maintenances:
 *   get:
 *     summary: Get all maintenance requests for current tenant
 *     tags: [Tenants]
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
 *                     statusCounts:
 *                       type: object
 *                       properties:
 *                         resolved:
 *                           type: number
 *                           description: Number of resolved maintenance requests
 *                         in progress:
 *                           type: number
 *                           description: Number of in progress maintenance requests
 *                         pending:
 *                           type: number
 *                           description: Number of pending maintenance requests
 *                     total:
 *                       type: number
 *                       description: Total number of maintenance requests
 *                 message:
 *                   type: string
 */
tenantRouter.get("/maintenances", authenticateToken, requireTenant, getAllMaintenances);

/**
 * @swagger
 * /tenants/maintenances/{id}:
 *   patch:
 *     summary: Update a maintenance request by ID for current tenant
 *     description: Update maintenance request details. Tenants can only update issue, description, category, and images. Status and contractor assignments are managed by landlords.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               issue:
 *                 type: string
 *                 description: Short issue summary
 *               description:
 *                 type: string
 *                 description: Detailed description
 *               category:
 *                 type: string
 *                 description: Category of the maintenance
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files (no limit)
 *     responses:
 *       200:
 *         description: Maintenance request updated successfully
 */
tenantRouter.patch(
  "/maintenances/:id",
  authenticateToken,
  requireTenant,
  upload.array('images'),
  updateMaintenanceById
);

/**
 * @swagger
 * /tenants/maintenances/{id}:
 *   delete:
 *     summary: Delete a maintenance request by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Maintenance request deleted successfully
 */
tenantRouter.delete("/maintenances/:id", authenticateToken, requireTenant, deleteMaintenanceById);


/**
 * @swagger
 * /tenants/properties/{propertyId}/rooms:
 *   get:
 *     summary: Get available rooms for a property
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available rooms retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       floor:
 *                         type: string
 *                       roomNumber:
 *                         type: string
 *                       roomIdentifier:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [available, occupied, reserved, maintenance]
 *                       rent:
 *                         type: number

 *             example:
 *               status: true
 *               data: [
 *                 {
 *                   "floor": "2",
 *                   "roomNumber": "16",
 *                   "roomIdentifier": "Floor 2/Rm 16",
 *                   "status": "available",
 *                   "rent": 1200
 *                 },
 *                 {
 *                   "floor": "2",
 *                   "roomNumber": "17",
 *                   "roomIdentifier": "Floor 2/Rm 17",
 *                   "status": "available",
 *                   "rent": 1100
 *                 }
 *               ]
 *               message: "Available rooms retrieved successfully"
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               status: false
 *               message: "Property not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               status: false
 *               message: "Failed to retrieve available rooms"
 */
tenantRouter.get("/properties/:propertyId/rooms", authenticateToken, requireTenant, getAvailableRooms);


/**
 * @swagger
 * /tenants/leases/{leaseId}/details:
 *   get:
 *     summary: Get detailed lease information
 *     description: Retrieve comprehensive lease details including landlord, tenant, premises, and lease terms information
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     responses:
 *       200:
 *         description: Lease details retrieved successfully
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
 *                     dateCreated:
 *                       type: string
 *                       format: date-time
 *                       description: Date when the lease was created
 *                     status:
 *                       type: string
 *                       enum: [active, inactive, pending, expired]
 *                       description: Current status of the lease
 *                     landlord:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           description: Landlord's full name
 *                         address:
 *                           type: string
 *                           description: Landlord's address
 *                         phoneNumber:
 *                           type: string
 *                           description: Landlord's phone number
 *                         email:
 *                           type: string
 *                           description: Landlord's email address
 *                     tenant:
 *                       type: object
 *                       properties:
 *                         fullName:
 *                           type: string
 *                           description: Tenant's full name
 *                         address:
 *                           type: string
 *                           description: Tenant's address
 *                         phoneNumber:
 *                           type: string
 *                           description: Tenant's phone number
 *                         email:
 *                           type: string
 *                           description: Tenant's email address
 *                     premises:
 *                       type: object
 *                       properties:
 *                         propertyName:
 *                           type: string
 *                           description: Name of the property
 *                         propertyAddress:
 *                           type: string
 *                           description: Full address of the property
 *                         apartmentNumber:
 *                           type: string
 *                           description: Apartment number or identifier
 *                         city:
 *                           type: string
 *                           description: City where the property is located
 *                         state:
 *                           type: string
 *                           description: State or region where the property is located
 *                         zip:
 *                           type: string
 *                           description: Postal code of the property
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       description: Lease start date
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       description: Lease end date
 *                     rentAmount:
 *                       type: number
 *                       description: Monthly rent amount
 *                     paymentFrequency:
 *                       type: string
 *                       enum: [monthly, weekly, annually]
 *                       description: How often rent is due
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                       description: Next rent due date
 *                     firstRentDueDate:
 *                       type: string
 *                       format: date-time
 *                       description: First rent due date
 *                     paymentMethod:
 *                       type: string
 *                       description: Method of payment for rent
 *                     securityDamageAmount:
 *                       type: number
 *                       description: Security deposit amount
 *                     utilities:
 *                       type: array
 *                       items:
 *                         type: string
 *                         enum: [electricity, water, wifi]
 *                       description: Utilities included in the rent
 *                     additionalOccupants:
 *                       type: number
 *                       description: Number of additional occupants allowed
 *                     petPolicy:
 *                       type: string
 *                       description: Pet policy for the property
 *                     noticePeriodWeeks:
 *                       type: number
 *                       description: Number of weeks notice required before termination
 *                 message:
 *                   type: string
 *             example:
 *               status: true
 *               data:
 *                 dateCreated: "2024-01-15T10:30:00Z"
 *                 status: "active"
 *                 landlord:
 *                   fullName: "John Smith"
 *                   address: "123 Landlord St, City, State 12345"
 *                   phoneNumber: "+1234567890"
 *                   email: "landlord@example.com"
 *                 tenant:
 *                   fullName: "Jane Doe"
 *                   address: "456 Tenant Ave, City, State 12345"
 *                   phoneNumber: "+0987654321"
 *                   email: "tenant@example.com"
 *                 premises:
 *                   propertyName: "Sunset Apartments"
 *                   propertyAddress: "789 Property Blvd, City, State 12345"
 *                   apartmentNumber: "Apt 101"
 *                   city: "City"
 *                   state: "State"
 *                   zip: "12345"
 *                 startDate: "2024-02-01T00:00:00Z"
 *                 endDate: "2025-02-01T00:00:00Z"
 *                 rentAmount: 1200
 *                 paymentFrequency: "monthly"
 *                 dueDate: "2024-03-01T00:00:00Z"
 *                 firstRentDueDate: "2024-02-01T00:00:00Z"
 *                 paymentMethod: "Bank Transfer"
 *                 securityDamageAmount: 1200
 *                 utilities: ["electricity", "water"]
 *                 additionalOccupants: 0
 *                 petPolicy: "No pets allowed"
 *                 noticePeriodWeeks: 4
 *               message: "Lease details retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Lease does not belong to the authenticated tenant
 *       404:
 *         description: Lease not found
 *       500:
 *         description: Server error
 */
tenantRouter.get("/leases/:leaseId/details", authenticateToken, requireTenant, getLeaseDetails);

/**
 * @swagger
 * /tenants/leases/{leaseId}/terminate:
 *   post:
 *     summary: Terminate a lease
 *     description: Submit a lease termination request with proposed termination date, reason, and additional comments
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID to terminate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proposedTerminationDate
 *               - reasonForTermination
 *             properties:
 *               proposedTerminationDate:
 *                 type: string
 *                 format: date
 *                 description: Proposed date for lease termination (YYYY-MM-DD)
 *                 example: "2024-12-31"
 *               reasonForTermination:
 *                 type: string
 *                 description: Reason for terminating the lease
 *                 example: "Moving to a new city for work"
 *               additionalComment:
 *                 type: string
 *                 description: Additional comments or details about the termination
 *                 example: "I have found a new job opportunity that requires relocation"
 *     responses:
 *       200:
 *         description: Lease termination request submitted successfully
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
 *                     leaseId:
 *                       type: string
 *                       description: ID of the terminated lease
 *                     isTerminated:
 *                       type: boolean
 *                       description: Whether the lease is terminated
 *                     status:
 *                       type: string
 *                       description: New status of the lease
 *                     termination:
 *                       type: object
 *                       properties:
 *                         proposedDate:
 *                           type: string
 *                           format: date
 *                           description: Proposed termination date
 *                         reason:
 *                           type: string
 *                           description: Reason for termination
 *                         comment:
 *                           type: string
 *                           description: Additional comment
 *                         terminatedAt:
 *                           type: string
 *                           format: date-time
 *                           description: When the termination was processed
 *                     landlord:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: Landlord's full name
 *                         email:
 *                           type: string
 *                           description: Landlord's email address
 *                 message:
 *                   type: string
 *             example:
 *               status: true
 *               data:
 *                 leaseId: "60d0fe4f5311236168a109cf"
 *                 isTerminated: true
 *                 status: "inactive"
 *                 termination:
 *                   proposedDate: "2024-12-31"
 *                   reason: "Moving to a new city for work"
 *                   comment: "I have found a new job opportunity that requires relocation"
 *                   terminatedAt: "2024-01-15T10:30:00Z"
 *                 landlord:
 *                   name: "John Smith"
 *                   email: "landlord@example.com"
 *               message: "Lease termination request submitted successfully"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             examples:
 *               missing_fields:
 *                 value:
 *                   status: false
 *                   message: "proposedTerminationDate and reasonForTermination are required"
 *               invalid_date:
 *                 value:
 *                   status: false
 *                   message: "Invalid proposedTerminationDate format. Use YYYY-MM-DD"
 *               past_date:
 *                 value:
 *                   status: false
 *                   message: "Proposed termination date cannot be in the past"
 *               already_terminated:
 *                 value:
 *                   status: false
 *                   message: "Lease is already terminated"
 *               not_active:
 *                 value:
 *                   status: false
 *                   message: "Only active leases can be terminated"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Lease does not belong to the authenticated tenant
 *       404:
 *         description: Lease not found
 *       500:
 *         description: Server error
 */
tenantRouter.post("/leases/:leaseId/terminate", authenticateToken, requireTenant, terminateLease);




/**
 * @swagger
 * /tenants/payments/{id}:
 *   get:
 *     summary: Get a payment by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 */
tenantRouter.get("/payments/:id", authenticateToken, requireTenant, getTenantPaymentById);

/**
 * @swagger
 * /tenants/payments:
 *   get:
 *     summary: Get all payments for current tenant (paginated)
 *     description: Retrieve all payments with payment summary statistics including total paid, last payment date, and pending amount
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
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
 *                     $ref: '#/components/schemas/TenantPayment'
 *                 total:
 *                   type: number
 *                   description: Total number of payments
 *                 page:
 *                   type: number
 *                   description: Current page number
 *                 pageSize:
 *                   type: number
 *                   description: Number of items per page
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalPayment:
 *                       type: number
 *                       description: Total amount of paid payments
 *                     lastPayment:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: Date of the last payment made
 *                     pendingPayment:
 *                       type: number
 *                       description: Total amount of pending and outstanding payments
 *                 message:
 *                   type: string
 *             example:
 *               status: true
 *               data: [
 *                 {
 *                   "_id": "60d0fe4f5311236168a109cf",
 *                   "tenant": "60d0fe4f5311236168a109ce",
 *                   "description": "Monthly rent for July 2025",
 *                   "amount": 950,
 *                   "dueDate": "2025-07-01T00:00:00.000Z",
 *                   "transactionId": "TXN20250701001",
 *                   "status": "paid",
 *                   "paymentMethod": "Credit Card"
 *                 }
 *               ]
 *               total: 5
 *               page: 1
 *               pageSize: 10
 *               summary:
 *                 totalPayment: 2850
 *                 lastPayment: "2025-07-01T08:45:00.000Z"
 *                 pendingPayment: 950
 *               message: "Payments retrieved successfully"
 */
tenantRouter.get("/payments", authenticateToken, requireTenant, getAllTenantPayments);

/**
 * @swagger
 * /tenants/payments/{id}:
 *   delete:
 *     summary: Delete a payment by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 */
tenantRouter.delete("/payments/:id", authenticateToken, requireTenant, deleteTenantPaymentById);

/**
 * @swagger
 * /tenants/payments/{id}:
 *   patch:
 *     summary: Update a payment by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantPayment'
 *           example:
 *             description: "Updated rent payment description"
 *             amount: 1000
 *             status: "paid"
 *             paymentMethod: "Credit Card"
 *             receipt:
 *               receiptNumber: "RCPT-20250701-004"
 *               property: "60d0fe4f5311236168a109cf"
 *               notes: "Updated payment via credit card"
 *     responses:
 *       200:
 *         description: Payment updated successfully
 */
// TODO: Payment updates are disabled for audit trail integrity
// Payments should be immutable once created for accounting and compliance reasons
// tenantRouter.patch("/payments/:id", authenticateToken, requireTenant, updateTenantPaymentById);



/**
 * @swagger
 * /tenants/payment-summary:
 *   post:
 *     summary: Create a new payment summary for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSummary'
 *           example:
 *             description: "Maintenance fee for July 2025"
 *             dueDate: "2025-07-05T00:00:00.000Z"
 *             amount: 50
 *             duration: "One-time"
 *             status: "cleared"
 *             action: "paid"
 *     responses:
 *       201:
 *         description: Payment summary created successfully
 */
tenantRouter.post("/payment-summary", authenticateToken, requireTenant, createPaymentSummary);

/**
 * @swagger
 * /tenants/payment-summary/{id}:
 *   get:
 *     summary: Get a payment summary by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment summary retrieved successfully
 */
tenantRouter.get("/payment-summary/:id", authenticateToken, requireTenant, getPaymentSummaryById);

/**
 * @swagger
 * /tenants/payment-summary:
 *   get:
 *     summary: Get all payment summaries for current tenant
 *     description: Retrieve all payment summaries with additional dashboard summary information including overdue and missed payments
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summaries retrieved successfully
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
 *                     $ref: '#/components/schemas/PaymentSummary'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     overduePayments:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           description: Number of overdue payments
 *                         amount:
 *                           type: number
 *                           description: Total amount of overdue payments
 *                     missedPayments:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           description: Number of missed payments
 *                         amount:
 *                           type: number
 *                           description: Total amount of missed payments
 *                         payments:
 *                           type: array
 *                           description: Array of missed payment details
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: Payment summary ID
 *                               description:
 *                                 type: string
 *                                 description: Payment description
 *                               dueDate:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Due date of the payment
 *                               amount:
 *                                 type: number
 *                                 description: Payment amount
 *                               duration:
 *                                 type: string
 *                                 description: Payment duration
 *                               status:
 *                                 type: string
 *                                 description: Payment status
 *                               action:
 *                                 type: string
 *                                 description: Payment action
 *                     totalPayments:
 *                       type: number
 *                       description: Total number of payment summaries
 *                 message:
 *                   type: string
 *             example:
 *               status: true
 *               data: [
 *                 {
 *                   "_id": "60d0fe4f5311236168a109cf",
 *                   "tenant": "60d0fe4f5311236168a109ce",
 *                   "description": "Monthly rent for July 2025",
 *                   "dueDate": "2025-07-01T00:00:00.000Z",
 *                   "amount": 950,
 *                   "duration": "monthly",
 *                   "status": "outstanding",
 *                   "action": "pending"
 *                 }
 *               ]
 *               summary:
 *                 overduePayments:
 *                   count: 2
 *                   amount: 1900
 *                 missedPayments:
 *                   count: 1
 *                   amount: 950
 *                   payments: [
 *                     {
 *                       "id": "60d0fe4f5311236168a109cf",
 *                       "description": "Monthly rent for March 2025",
 *                       "dueDate": "2025-03-25T00:00:00.000Z",
 *                       "amount": 950,
 *                       "duration": "monthly",
 *                       "status": "outstanding",
 *                       "action": "missed"
 *                     }
 *                   ]
 *                 totalPayments: 5
 *               message: "Payment summaries retrieved successfully"
 */
tenantRouter.get("/payment-summary", authenticateToken, requireTenant, getAllPaymentSummaries);

/**
 * @swagger
 * /tenants/payment-summary/{id}:
 *   delete:
 *     summary: Delete a payment summary by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment summary deleted successfully
 */
tenantRouter.delete("/payment-summary/:id", authenticateToken, requireTenant, deletePaymentSummaryById);

/**
 * @swagger
 * /tenants/payment-summary/{id}:
 *   patch:
 *     summary: Update a payment summary by ID for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSummary'
 *           example:
 *             description: "Updated maintenance fee for July 2025"
 *             dueDate: "2025-07-10T00:00:00.000Z"
 *             amount: 60
 *             duration: "One-time"
 *             status: "cleared"
 *             action: "paid"
 *     responses:
 *       200:
 *         description: Payment summary updated successfully
 */
tenantRouter.patch("/payment-summary/:id", authenticateToken, requireTenant, updatePaymentSummaryById);

// ==================== TOUR ROUTES ====================

/**
 * @swagger
 * /tenants/tours/request:
 *   post:
 *     summary: Request a property tour
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - date
 *               - timeSlot
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: ID of the property to tour
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the tour (YYYY-MM-DD)
 *               timeSlot:
 *                 type: string
 *                 enum: [09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00]
 *                 description: Time slot for the tour
 *           example:
 *             propertyId: "60d0fe4f5311236168a109cc"
 *             date: "2024-07-15"
 *             timeSlot: "14:00"
 *     responses:
 *       201:
 *         description: Tour request created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tenantRouter.post("/tours/request", authenticateToken, requireTenant, requestTour);

/**
 * @swagger
 * /tenants/tours:
 *   get:
 *     summary: Get tenant's tours
 *     tags: [Tenants]
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
tenantRouter.get("/tours", authenticateToken, requireTenant, getMyTours);

/**
 * @swagger
 * /tenants/tours/{tourId}:
 *   get:
 *     summary: Get tour by ID
 *     tags: [Tenants]
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
 *   delete:
 *     summary: Cancel tour
 *     tags: [Tenants]
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
 *         description: Tour cancelled successfully
 *       404:
 *         description: Tour not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tenantRouter.get("/tours/:tourId", authenticateToken, requireTenant, getTourById);
tenantRouter.delete("/tours/:tourId", authenticateToken, requireTenant, cancelTour);

/**
 * @swagger
 * /tenants/tours/{tourId}/reschedule:
 *   patch:
 *     summary: Reschedule tour
 *     tags: [Tenants]
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
tenantRouter.patch("/tours/:tourId/reschedule", authenticateToken, requireTenant, rescheduleTour);

/**
 * @swagger
 * /tenants/tours/available-slots/{propertyId}:
 *   get:
 *     summary: Get available time slots for a property
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Available time slots retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
tenantRouter.get("/tours/available-slots/:propertyId", getAvailableTimeSlots);

/*
// tenant applications
tenantRouter.post("/me/applications", (req,res)=> {})
tenantRouter.get("/me/application", (req,res)=> {})
tenantRouter.get("/me/application/:id", (req,res)=> {})
tenantRouter.patch("/me/application/:id", (req,res)=> {})
tenantRouter.delete("/me/application/:id", (req,res)=> {})

*/

/**
 * @swagger
 * /tenants/notifications:
 *   get:
 *     summary: Get notifications for the current tenant
 *     tags: [Tenants]
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
 *         description: Number of notifications per page
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, read, unread]
 *           default: all
 *         description: Filter notifications by read status
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tenantRouter.get("/notifications", authenticateToken, requireTenant, getTenantNotifications);

/**
 * @swagger
 * /tenants/notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
tenantRouter.patch("/notifications/:id/read", authenticateToken, requireTenant, markNotificationAsReadById);

/**
 * @swagger
 * /tenants/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read for the current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
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
 *                     modifiedCount:
 *                       type: integer
 *                       description: Number of notifications marked as read
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tenantRouter.patch("/notifications/read-all", authenticateToken, requireTenant, markAllNotificationsAsReadForTenant);

/**
 * @swagger
 * /tenants/notifications/unread-count:
 *   get:
 *     summary: Get count of unread notifications for the current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
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
 *                     unreadCount:
 *                       type: integer
 *                       description: Number of unread notifications
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tenantRouter.get("/notifications/unread-count", authenticateToken, requireTenant, getUnreadNotificationCountForTenant);

/**
 * @swagger
 * /tenants/contact-agent:
 *   post:
 *     summary: Contact buyer agent via email
 *     description: Send an email to a buyer agent with tenant's message and contact information
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentEmail
 *               - message
 *               - wantFinancingInfo
 *             properties:
 *               agentEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address of the buyer agent
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Message to send to the agent
 *               wantFinancingInfo:
 *                 type: boolean
 *                 description: Whether the tenant wants financing information
 *           example:
 *             agentEmail: "agent@example.com"
 *             message: "I'm interested in learning more about this property and would like to schedule a viewing."
 *             wantFinancingInfo: true
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     agentEmail:
 *                       type: string
 *                     messageSent:
 *                       type: boolean
 *                     confirmationSent:
 *                       type: boolean
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
tenantRouter.post("/contact-agent", authenticateToken, requireTenant, contactBuyerAgent);

// ==================== APPLICATION ROUTES ====================

/**
 * @swagger
 * /tenants/properties/{propertyId}/start-application:
 *   post:
 *     summary: Start a new rental application for a property
 *     tags: [Tenants]
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
 *       201:
 *         description: Application started successfully
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
 *                       description: Application ID
 *                     tenant:
 *                       type: string
 *                       description: Tenant ObjectId reference
 *                     property:
 *                       type: string
 *                       description: Property ObjectId reference
 *                     landlord:
 *                       type: string
 *                       description: Landlord ObjectId reference
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, cancelled]
 *                     applicantInfo:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         address:
 *                           type: string
 *                         country:
 *                           type: string
 *                         city:
 *                           type: string
 *                         profilePicture:
 *                           type: string
 *                         desiredMoveInDate:
 *                           type: string
 *                           format: date
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Application already exists for this property
 *       404:
 *         description: Property or tenant not found
 *       500:
 *         description: Server error
 */
tenantRouter.post("/properties/:propertyId/start-application", authenticateToken, requireTenant, startApplication);

/**
 * @swagger
 * /tenants/applications:
 *   get:
 *     summary: Get all applications for the current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, cancelled]
 *           default: all
 *         description: Filter by application status
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
 *         description: Number of applications per page
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Application ID
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, cancelled]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           property:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               propertyName:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               monthlyRent:
 *                                 type: number
 *                               propertyType:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               bedrooms:
 *                                 type: number
 *                               bathrooms:
 *                                 type: number
 *                               frontImage:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                           landlord:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */
tenantRouter.get("/applications", authenticateToken, requireTenant, getMyApplications);

/**
 * @swagger
 * /tenants/applications/{applicationId}:
 *   get:
 *     summary: Get a specific application by ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
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
 *                       description: Application ID
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, cancelled]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     property:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         propertyName:
 *                           type: string
 *                         address:
 *                           type: string
 *                         monthlyRent:
 *                           type: number
 *                         propertyType:
 *                           type: array
 *                           items:
 *                             type: string
 *                         bedrooms:
 *                           type: number
 *                         bathrooms:
 *                           type: number
 *                         frontImage:
 *                           type: string
 *                         description:
 *                           type: string
 *                     landlord:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
tenantRouter.get("/applications/:applicationId", authenticateToken, requireTenant, getApplicationById);



/**
 * @swagger
 * /tenants/applications/{applicationId}/cancel:
 *   patch:
 *     summary: Cancel an application
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application cancelled successfully
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
 *                       description: Application ID

 *                     property:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         propertyName:
 *                           type: string
 *                         address:
 *                           type: string
 *                         monthlyRent:
 *                           type: number
 *                         propertyType:
 *                           type: array
 *                           items:
 *                             type: string
 *                         bedrooms:
 *                           type: number
 *                         bathrooms:
 *                           type: number
 *                         frontImage:
 *                           type: string
 *                         description:
 *                           type: string
 *                     landlord:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, cancelled]


 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *           example:
 *             status: true
 *             data:
 *               _id: "6890ef8984320fa3ffbc40f3"
 *               status: "cancelled"
 *               createdAt: "2025-08-04T17:36:09.818Z"
 *               updatedAt: "2025-08-04T17:37:42.604Z"
 *               property:
 *                 amenities:
 *                   wifi: false
 *                   electricity: false
 *                   furnishedKitchen: true
 *                   water: false
 *                   gym: false
 *                 _id: "68869fe2559174f019c10e45"
 *                 landlord: "68868784070ef7d2dae7fea5"
 *                 propertyName: "pablo bulus house"
 *                 propertyType: ["detached-house"]
 *                 address: "yelwan"
 *                 frontImage: "/src/uploads/property/1753653218907_c56c853b-24f0-42bc-8fc9-5387ef169b85_21ed4d8e23a12d41897b4d0f97f2bf3c.jpg"
 *                 propertyImages: ["/src/uploads/property/1753653218910_07b297bb-d567-4b69-bfb8-557d9ab16c1d_54e522d3d31de9dabe9546857ae27649.jpg"]
 *                 description: "pablo bulus house close to the nigga graadfasdfew"
 *                 bedrooms: 6
 *                 bathrooms: 26
 *                 furnished: true
 *                 sharedAreas: ["dining room"]
 *                 billsIncluded: ["water"]
 *                 monthlyRent: 535345354
 *                 depositAmount: 23535353
 *                 tenancy: "monthly"
 *                 availableFrom: "2025-07-27T00:00:00.000Z"
 *                 paymentFrequency: "weekly"
 *                 addressLine1: "yelwan"
 *                 cityOrTown: "bauchi"
 *                 postalCode: "454545"
 *                 regionOrCountry: "Nigeria"
 *                 createdAt: "2025-07-27T21:53:38.947Z"
 *                 updatedAt: "2025-07-27T21:53:38.947Z"
 *                 __v: 0
 *               landlord:
 *                 _id: "68868784070ef7d2dae7fea5"
 *                 firstName: "Bulus"
 *                 lastName: "Madu"
 *                 email: "hamnubulus75@gmail.com"
 *                 phoneNumber: "+234876458893"
 *             message: "Application retrieved successfully"
 *             error: null
 *       400:
 *         description: Cannot cancel non-pending application
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
tenantRouter.patch("/applications/:applicationId/cancel", authenticateToken, requireTenant, cancelApplication);

// ==================== RENTAL HISTORY ROUTES ====================

/**
 * @swagger
 * /tenants/rental-history:
 *   post:
 *     summary: Create a new rental history record
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - previousLandlord
 *               - rentalDates
 *               - reasonForLeaving
 *               - rentAmount
 *             properties:
 *               previousLandlord:
 *                 type: string
 *                 description: Name of the previous landlord
 *               rentalDates:
 *                 type: object
 *                 required:
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Start date of the rental period
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: End date of the rental period
 *               reasonForLeaving:
 *                 type: string
 *                 description: Reason for leaving the previous rental
 *               rentAmount:
 *                 type: number
 *                 description: Monthly rent amount for this rental
 *               propertyAddress:
 *                 type: string
 *                 description: Address of the previous rental property
 *           example:
 *             previousLandlord: "Jane Smith"
 *             rentalDates:
 *               startDate: "2022-01-01"
 *               endDate: "2023-12-31"
 *             reasonForLeaving: "Moving to a new city for work"
 *             rentAmount: 1500
 *             propertyAddress: "456 Oak St, New York, NY 10002"
 *     responses:
 *       201:
 *         description: Rental history record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RentalHistory'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all rental history records for the current tenant
 *     tags: [Tenants]
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
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Rental history retrieved successfully
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
 *                     rentalHistory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RentalHistory'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */
tenantRouter.post("/rental-history", authenticateToken, requireTenant, createRentalHistory);
tenantRouter.get("/rental-history", authenticateToken, requireTenant, getAllRentalHistory);

/**
 * @swagger
 * /tenants/rental-history/{id}:
 *   get:
 *     summary: Get a specific rental history record by ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental history record ID
 *     responses:
 *       200:
 *         description: Rental history record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RentalHistory'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Rental history record not found
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update a rental history record by ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental history record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               previousLandlord:
 *                 type: string
 *                 description: Name of the previous landlord
 *               rentalDates:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Start date of the rental period
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: End date of the rental period
 *               reasonForLeaving:
 *                 type: string
 *                 description: Reason for leaving the previous rental
 *               rentAmount:
 *                 type: number
 *                 description: Monthly rent amount for this rental
 *               propertyAddress:
 *                 type: string
 *                 description: Address of the previous rental property
 *     responses:
 *       200:
 *         description: Rental history record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RentalHistory'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Rental history record not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a rental history record by ID
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rental history record ID
 *     responses:
 *       200:
 *         description: Rental history record deleted successfully
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
 *         description: Rental history record not found
 *       500:
 *         description: Server error
 */
tenantRouter.get("/rental-history/:id", authenticateToken, requireTenant, getRentalHistoryById);
tenantRouter.patch("/rental-history/:id", authenticateToken, requireTenant, updateRentalHistory);
tenantRouter.delete("/rental-history/:id", authenticateToken, requireTenant, deleteRentalHistory);

// Chat routes
/**
 * @swagger
 * /tenants/chat/send:
 *   post:
 *     summary: Send a message to a landlord
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - recipientType
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID of the landlord to send message to
 *               recipientType:
 *                 type: string
 *                 enum: [landlord]
 *                 description: Type of recipient (must be landlord for tenants)
 *               content:
 *                 type: string
 *                 description: Message content
 *               propertyId:
 *                 type: string
 *                 description: Optional property ID for context
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatId:
 *                       type: string
 *                     message:
 *                       type: object
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
tenantRouter.post("/chat/send", authenticateToken, requireTenant, sendMessage);

/**
 * @swagger
 * /tenants/chat/user:
 *   get:
 *     summary: Get all chats for the current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chats retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         type: object
 *                     userType:
 *                       type: string
 *                       example: "tenant"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
tenantRouter.get("/chat/user", authenticateToken, requireTenant, getUserChats);

/**
 * @swagger
 * /tenants/chat/history/{chatId}:
 *   get:
 *     summary: Get chat history for a specific chat
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
tenantRouter.get("/chat/history/:chatId", authenticateToken, requireTenant, getChatHistory);

/**
 * @swagger
 * /tenants/chat/history/{chatId}/paginated:
 *   get:
 *     summary: Get paginated chat history for a specific chat
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Paginated chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
tenantRouter.get("/chat/history/:chatId/paginated", authenticateToken, requireTenant, getChatHistoryPaginated);

/**
 * @swagger
 * /tenants/chat/{chatId}/mark-read:
 *   patch:
 *     summary: Mark messages as read in a specific chat
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Messages marked as read"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
tenantRouter.patch("/chat/:chatId/mark-read", authenticateToken, requireTenant, markMessagesAsRead);

/**
 * @swagger
 * /tenants/chat/unread-count:
 *   get:
 *     summary: Get total unread message count for the current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Unread count retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
tenantRouter.get("/chat/unread-count", authenticateToken, requireTenant, getUnreadCount);

export default tenantRouter 