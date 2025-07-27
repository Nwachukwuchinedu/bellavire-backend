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
  deletePaymentSummaryById
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
 * /tenants/notifications:
 *   patch:
 *     summary: Update notifications for current tenant
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
 *         description: Notifications updated successfully
 */
tenantRouter.patch("/notifications", authenticateToken, requireTenant, updateNotifications);

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
 *               - title
 *               - issue
 *               - date
 *               - category
 *               - propertyAddress
 *               - propertyId
 *               - landlordId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Leaking faucet"
 *                 description: Title of the maintenance request
 *               issue:
 *                 type: string
 *                 example: "The kitchen faucet is leaking."
 *                 description: Short issue summary
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-07-01T10:00:00Z"
 *                 description: Date of the maintenance request
 *               category:
 *                 type: string
 *                 example: "plumbing"
 *                 description: Category of the maintenance
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files
 *               propertyAddress:
 *                 type: string
 *                 example: "123 Main St, London, UK"
 *                 description: Address of the property
 *               propertyId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cf"
 *                 description: Property ObjectId
 *               landlordId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ce"
 *                 description: Landlord ObjectId
 *               description:
 *                 type: string
 *                 example: "The faucet in the kitchen has been leaking for two days."
 *                 description: Detailed description
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
 *     description: Update maintenance request details. Tenants can only update title, issue, description, category, and images. Status and contractor assignments are managed by landlords.
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
 *               title:
 *                 type: string
 *                 description: Title of the maintenance request
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
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lease'
 *           example:
 *             startDate: "2025-07-25T18:22:50.742Z"
 *             expirationDate: "2026-07-25T18:22:50.742Z"
 *             duration: "12 months"
 *             status: "active"
 *             currentProperty: "propertyId"
 *             streetName: "123 Main St"
 *             rent: 1200
 *             apartment: "Apt 4B"
 *             city: "New York"
 *             zipCode: "10001"
 *             landlordDetail:
 *               name: "John Landlord"
 *               address: "456 Landlord Ave"
 *               phone: "+1234567890"
 *               email: "landlord@example.com"
 *             tenantDetail:
 *               name: "Jane Tenant"
 *               email: "tenant@example.com"
 *               phone: "+1987654321"
 *               address: "789 Tenant Rd"
 *             propertyDetail:
 *               address: "123 Main St"
 *               apartmentNo: "4B"
 *               zip: "10001"
 *               city: "New York"
 *               state: "NY"
 *             leaseDocument: "https://example.com/lease.pdf"
 *             isTerminated: false
 *     responses:
 *       201:
 *         description: Lease agreement created successfully
 */
tenantRouter.post("/leases", authenticateToken, requireTenant, createLeaseAgreement);

/**
 * @swagger
 * /tenants/leases/{id}:
 *   patch:
 *     summary: Update a lease agreement by ID for current tenant
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
 *             $ref: '#/components/schemas/Lease'
 *     responses:
 *       200:
 *         description: Lease agreement updated successfully
 */
tenantRouter.patch("/leases/:id", authenticateToken, requireTenant, updateLeaseAgreementById);

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


/*
// tenant applications
tenantRouter.post("/me/applications", (req,res)=> {})
tenantRouter.get("/me/application", (req,res)=> {})
tenantRouter.get("/me/application/:id", (req,res)=> {})
tenantRouter.patch("/me/application/:id", (req,res)=> {})
tenantRouter.delete("/me/application/:id", (req,res)=> {})

*/


export default tenantRouter 