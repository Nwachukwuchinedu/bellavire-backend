import express from "express"
import { authenticateToken, requireTenant } from "../middleware/authMiddleware.js";
import {
  // Tenant controllers
  // getCurrentTenant,
  // createTenant,
  updateTenant,
  // getAllTenants,
  // Tenant field patch controllers
  updateLeaseSetting,
  updateSocialLinks,
  updateNotifications,
  // Payment method controllers
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  deletePaymentMethodById,
  // Saved properties controllers
  getSavedProperties,
  getSavedPropertyById,
  addSavedProperty,
  removeSavedProperty,
  // Maintenance controllers
  createMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenanceById,
  deleteMaintenanceById,
  // Lease setting controllers
  getLeaseSetting,
  createLeaseSetting,
  updateLeaseSettingById,
  // Lease agreement controllers
  getLeaseAgreement,
  getLeaseAgreementById,
  createLeaseAgreement,
  updateLeaseAgreementById,
  terminateLeaseAgreementById,
  // Tenant payment controllers
  getAllTenantPayments,
  getTenantPaymentById,
  createTenantPayment,
  updateTenantPaymentById,
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
  getUnreadNotificationCountForTenant
} from "../controllers/tenantController.js";
import upload from "../middleware/uploadMiddleware.js";

/**
 * @swagger
 * tags:
 *   - name: Tenants
 *     description: Tenant management and operations
 */

const tenantRouter = express.Router()

// Get current tenant profile
// tenantRouter.get("/me",authenticateToken, getCurrentTenant);

// // Create a new tenant
// tenantRouter.post("/me",authenticateToken, createTenant);

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
 *               employmentStatus:
 *                 type: string
 *                 enum: [full_time, part_time, self_employed, student]
 *               monthlyIncome:
 *                 type: number
 *               employer:
 *                 type: string
 *               address:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *                 enum: [english, french, german]
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

// /**
//  * @swagger
//  * /tenants:
//  *   get:
//  *     summary: Get all tenants
//  *     tags: [Tenants]
//  *     responses:
//  *       200:
//  *         description: Tenants retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: boolean
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Tenant'
//  *                 message:
//  *                   type: string
//  */
// tenantRouter.get("/", getAllTenants);


/**
 * @swagger
 * /tenants/social-links:
 *   patch:
 *     summary: Update social links for current tenant
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
 *               socialLinks:
 *                 $ref: '#/components/schemas/Tenant/properties/socialLinks'
 *     responses:
 *       200:
 *         description: Social links updated successfully
 */
tenantRouter.patch("/social-links", authenticateToken, requireTenant, updateSocialLinks);

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
 * /tenants/payment-methods:
 *   post:
 *     summary: Add a Stripe payment method for current tenant
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
 *               - stripePaymentMethodId
 *               - stripeCustomerId
 *             properties:
 *               stripePaymentMethodId:
 *                 type: string
 *                 description: Stripe payment method ID
 *               stripeCustomerId:
 *                 type: string
 *                 description: Stripe customer ID
 *           example:
 *             stripePaymentMethodId: "pm_1N..."
 *             stripeCustomerId: "cus_N..."
 *     responses:
 *       201:
 *         description: Payment method added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentMethod'
 */
tenantRouter.post("/payment-methods", authenticateToken, requireTenant, createPaymentMethod);

/**
 * @swagger
 * /tenants/payment-methods:
 *   get:
 *     summary: Get all payment methods for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
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
 *                     $ref: '#/components/schemas/PaymentMethod'
 *                 message:
 *                   type: string
 */
tenantRouter.get("/payment-methods", authenticateToken, requireTenant, getAllPaymentMethods);

/**
 * @swagger
 * /tenants/payment-methods/{id}:
 *   get:
 *     summary: Get a payment method by ID for current tenant
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
 *         description: Payment method retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentMethod'
 */
tenantRouter.get("/payment-methods/:id", authenticateToken, requireTenant, getPaymentMethodById);

/**
 * @swagger
 * /tenants/payment-methods/{id}:
 *   delete:
 *     summary: Delete a payment method by ID for current tenant
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
 *         description: Payment method deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentMethod'
 */
tenantRouter.delete("/payment-methods/:id", authenticateToken, requireTenant, deletePaymentMethodById);

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
 */
tenantRouter.get("/saved-properties", authenticateToken, requireTenant, getSavedProperties);

/**
 * @swagger
 * /tenants/saved-properties/{id}:
 *   get:
 *     summary: Get a saved property by ID for current tenant
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
 *         description: Saved property retrieved successfully
 */
tenantRouter.get("/saved-properties/:id", authenticateToken, requireTenant, getSavedPropertyById);

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
 *               - propertyId
 *               - landlordId
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
 *               propertyId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cf"
 *                 description: Property ObjectId
 *               landlordId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ce"
 *                 description: Landlord ObjectId
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
 */
tenantRouter.post(
  "/maintenances",
  authenticateToken,
  requireTenant,
  upload.array('images', 10),
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
 * /tenants/maintenances:
 *   get:
 *     summary: Get all maintenance requests for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Maintenance requests retrieved successfully
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
 *                 description: Array of image files
 *     responses:
 *       200:
 *         description: Maintenance request updated successfully
 */
tenantRouter.patch(
  "/maintenances/:id",
  authenticateToken,
  requireTenant,
  upload.array('images', 10),
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
 * /tenants/lease-settings:
 *   get:
 *     summary: Get lease setting for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lease setting retrieved successfully
 */
tenantRouter.get("/lease-settings", authenticateToken, requireTenant, getLeaseSetting);

/**
 * @swagger
 * /tenants/lease-settings:
 *   post:
 *     summary: Create lease setting for current tenant
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
 *               leaseSetting:
 *                 $ref: '#/components/schemas/Tenant/properties/leaseSetting'
 *     responses:
 *       201:
 *         description: Lease setting created successfully
 */
tenantRouter.post("/lease-settings", authenticateToken, requireTenant, createLeaseSetting);

/**
 * @swagger
 * /tenants/lease-setting:
 *   patch:
 *     summary: Update lease setting for current tenant
 *     description: Update or toggle any field in the leaseSetting object for the current tenant.
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
 *               leaseSetting:
 *                 $ref: '#/components/schemas/Tenant/properties/leaseSetting'
 *     responses:
 *       200:
 *         description: Lease setting updated successfully
 */
tenantRouter.patch("/lease-setting", authenticateToken, requireTenant, updateLeaseSetting);

/**
 * @swagger
 * /tenants/leases:
 *   get:
 *     summary: Get all lease agreements for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lease agreements retrieved successfully
 */
tenantRouter.get("/leases", authenticateToken, requireTenant, getLeaseAgreement);

/**
 * @swagger
 * /tenants/leases/{id}:
 *   get:
 *     summary: Get a lease agreement by ID for current tenant
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
 *         description: Lease agreement retrieved successfully
 */
tenantRouter.get("/leases/:id", authenticateToken, requireTenant, getLeaseAgreementById);

/**
 * @swagger
 * /tenants/leases:
 *   post:
 *     summary: Create a new lease agreement for current tenant
 *     description: Create a new lease agreement with optional lease document upload. The lease document will be uploaded to the server and the file path will be saved.
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
 *               - startDate
 *               - expirationDate
 *               - duration
 *               - currentProperty
 *               - streetName
 *               - rent
 *               - apartment
 *               - city
 *               - zipCode
 *               - landlordId
 *               - propertyId
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-25T18:22:50.742Z"
 *                 description: Lease start date
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-25T18:22:50.742Z"
 *                 description: Lease expiration date
 *               duration:
 *                 type: string
 *                 example: "12 months"
 *                 description: Duration of the lease
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: "active"
 *                 example: "active"
 *                 description: Status of the lease
 *               currentProperty:
 *                 type: string
 *                 example: "Sunset Villas"
 *                 description: Current property name
 *               streetName:
 *                 type: string
 *                 example: "123 Main St"
 *                 description: Street name of the property
 *               rent:
 *                 type: number
 *                 example: 1200
 *                 description: Rent amount per month
 *               apartment:
 *                 type: string
 *                 example: "Apt 4B"
 *                 description: Apartment number or name
 *               city:
 *                 type: string
 *                 example: "New York"
 *                 description: City
 *               zipCode:
 *                 type: string
 *                 example: "10001"
 *                 description: Zip code
 *               landlordId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ce"
 *                 description: Landlord ObjectId reference
 *               propertyId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cf"
 *                 description: Property ObjectId reference
 *               leaseDocument:
 *                 type: string
 *                 format: binary
 *                 description: Lease document file (PDF, DOC, DOCX, etc.)
 *     responses:
 *       201:
 *         description: Lease agreement created successfully
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
 */
tenantRouter.post("/leases", authenticateToken, requireTenant, upload.single('leaseDocument'), createLeaseAgreement);

/**
 * @swagger
 * /tenants/leases/{id}:
 *   patch:
 *     summary: Update a lease agreement by ID for current tenant
 *     description: Update a lease agreement with optional lease document upload. The lease document will be uploaded to the server and the file path will be saved.
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
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Lease start date
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Lease expiration date
 *               duration:
 *                 type: string
 *                 description: Duration of the lease
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Status of the lease
 *               currentProperty:
 *                 type: string
 *                 description: Current property name
 *               streetName:
 *                 type: string
 *                 description: Street name of the property
 *               rent:
 *                 type: number
 *                 description: Rent amount per month
 *               apartment:
 *                 type: string
 *                 description: Apartment number or name
 *               city:
 *                 type: string
 *                 description: City
 *               zipCode:
 *                 type: string
 *                 description: Zip code
 *               landlordId:
 *                 type: string
 *                 description: Landlord ObjectId reference
 *               propertyId:
 *                 type: string
 *                 description: Property ObjectId reference
 *               leaseDocument:
 *                 type: string
 *                 format: binary
 *                 description: Lease document file (PDF, DOC, DOCX, etc.)
 *     responses:
 *       200:
 *         description: Lease agreement updated successfully
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
 */
tenantRouter.patch("/leases/:id", authenticateToken, requireTenant, upload.single('leaseDocument'), updateLeaseAgreementById);

/**
 * @swagger
 * /tenants/leases/{id}/terminate:
 *   post:
 *     summary: Terminate a lease agreement by ID for current tenant
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
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               comment:
 *                 type: string
 *               terminatedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lease agreement terminated successfully
 */
tenantRouter.post("/leases/:id/terminate", authenticateToken, requireTenant, terminateLeaseAgreementById);

/**
 * @swagger
 * /tenants/payments:
 *   post:
 *     summary: Create a new payment for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantPayment'
 *           example:
 *             description: "Monthly rent payment for July 2025"
 *             amount: 950
 *             dueDate: "2025-07-01T00:00:00.000Z"
 *             transactionId: "TXN20250701001"
 *             status: "paid"
 *             paymentMethod: "Bank Transfer"
 *             receipt:
 *               receiptNumber: "RCPT-20250701-003"
 *               datePaid: "2025-07-01T08:45:00.000Z"
 *               paymentMethod: "Bank Transfer"
 *               transactionId: "TXN20250701001"
 *               email: "amina.yusuf@example.com"
 *               propertyName: "Sunset Villas"
 *               property: "60d0fe4f5311236168a109cf"
 *               address: "Sunset Villas, Freedom Way, Port Harcourt"
 *               tenantId: "tenant_003"
 *               leasePeriod: "2025-06-01 to 2026-05-31"
 *               monthlyRent: 950
 *               maintenanceFee: 50
 *               lateFee: 0
 *               notes: "Rent paid on time via bank transfer"
 *             receiptDocument: "https://example.com/receipts/RCPT-20250701-003.pdf"
 *             createdAt: "2025-07-01T08:46:00.000Z"
 *             updatedAt: "2025-07-25T18:55:30.524Z"
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
tenantRouter.post("/payments", authenticateToken, requireTenant, createTenantPayment);

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
tenantRouter.delete("/payments/:id", authenticateToken, requireTenant, deleteTenantPaymentById );

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
tenantRouter.patch("/payments/:id", authenticateToken, requireTenant, updateTenantPaymentById);

/**
 * @swagger
 * /tenants/payments/charge:
 *   post:
 *     summary: Make a payment for current tenant (Not implemented yet)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: Not implemented yet
 */
tenantRouter.post("/payments/charge", authenticateToken, requireTenant, /* createPaymentCharge */);

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
 *               duration:
 *                 type: number
 *                 default: 30
 *                 minimum: 15
 *                 maximum: 120
 *                 description: Duration in minutes
 *               tourType:
 *                 type: string
 *                 enum: [in-person, virtual]
 *                 default: in-person
 *                 description: Type of tour
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes from tenant
 *           example:
 *             propertyId: "60d0fe4f5311236168a109cc"
 *             date: "2024-07-15"
 *             timeSlot: "14:00"
 *             duration: 30
 *             tourType: "in-person"
 *             notes: "I'm interested in the property and would like to see it in person"
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

export default tenantRouter 