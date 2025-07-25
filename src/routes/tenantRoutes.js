import express from "express"
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  // Tenant controllers
  // getCurrentTenant,
  // createTenant,
  updateTenant,
  getAllTenants,
  // Tenant field patch controllers
  updateLeaseSetting,
  updateSocialLinks,
  updateNotifications,
  // Payment method controllers
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethodById,
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
 *             $ref: '#/components/schemas/Tenant'
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
tenantRouter.patch("/", authenticateToken, updateTenant);

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
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
 *                     $ref: '#/components/schemas/Tenant'
 *                 message:
 *                   type: string
 */
tenantRouter.get("/", getAllTenants);


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
tenantRouter.patch("/social-links", authenticateToken, updateSocialLinks);

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
tenantRouter.patch("/notifications", authenticateToken, updateNotifications);

/**
 * @swagger
 * /tenants/payment-methods:
 *   post:
 *     summary: Create a new payment method for current tenant
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
 *               - cardNumber
 *               - expiryDate
 *               - nameOnCard
 *             properties:
 *               cardNumber:
 *                 type: string
 *                 example: "4242424242424242"
 *                 description: Card number (will be encrypted)
 *               expiryDate:
 *                 type: string
 *                 example: "12/25"
 *                 description: Expiry date in MM/YY format
 *               nameOnCard:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Name on the card
 *           example:
 *             cardNumber: "4242424242424242"
 *             expiryDate: "12/25"
 *             nameOnCard: "John Doe"
 *     responses:
 *       201:
 *         description: Payment method created successfully
 */
tenantRouter.post("/payment-methods", authenticateToken, createPaymentMethod);

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
 */
tenantRouter.get("/payment-methods", authenticateToken, getAllPaymentMethods);

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
 */
tenantRouter.get("/payment-methods/:id", authenticateToken, getPaymentMethodById);

/**
 * @swagger
 * /tenants/payment-methods/{id}:
 *   patch:
 *     summary: Update a payment method by ID for current tenant
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
 *               cardNumber:
 *                 type: string
 *                 example: "4242424242424242"
 *                 description: Card number (will be encrypted)
 *               expiryDate:
 *                 type: string
 *                 example: "12/25"
 *                 description: Expiry date in MM/YY format
 *               nameOnCard:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Name on the card
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 */
tenantRouter.patch("/payment-methods/:id", authenticateToken, updatePaymentMethodById);

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
 */
tenantRouter.delete("/payment-methods/:id", authenticateToken, deletePaymentMethodById);

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
tenantRouter.get("/saved-properties", authenticateToken, getSavedProperties);

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
tenantRouter.get("/saved-properties/:id", authenticateToken, getSavedPropertyById);

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
tenantRouter.post("/saved-properties", authenticateToken, addSavedProperty);

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
tenantRouter.delete("/saved-properties/:id", authenticateToken, removeSavedProperty);

/**
 * @swagger
 * /tenants/maintenances:
 *   post:
 *     summary: Create a new maintenance request for current tenant
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
 *               - status
 *               - propertyAddress
 *             properties:
 *               title:
 *                 type: string
 *               issue:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [resolved, in progress, pending, failed]
 *                 default: "in progress"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               propertyAddress:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
 */
tenantRouter.post(
  "/maintenances",
  authenticateToken,
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
tenantRouter.get("/maintenances/:id", authenticateToken, getMaintenanceById);

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
tenantRouter.get("/maintenances", authenticateToken, getAllMaintenances);

/**
 * @swagger
 * /tenants/maintenances/{id}:
 *   patch:
 *     summary: Update a maintenance request by ID for current tenant
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
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Maintenance request updated successfully
 */
tenantRouter.patch(
  "/maintenances/:id",
  authenticateToken,
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
tenantRouter.delete("/maintenances/:id", authenticateToken, deleteMaintenanceById);

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
tenantRouter.get("/lease-settings", authenticateToken, getLeaseSetting);

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
tenantRouter.post("/lease-settings", authenticateToken, createLeaseSetting);

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
tenantRouter.patch("/lease-setting", authenticateToken, updateLeaseSetting);

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
tenantRouter.get("/leases", authenticateToken, getLeaseAgreement);

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
tenantRouter.get("/leases/:id", authenticateToken, getLeaseAgreementById);

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
tenantRouter.post("/leases", authenticateToken, createLeaseAgreement);

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
tenantRouter.patch("/leases/:id", authenticateToken, updateLeaseAgreementById);

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
tenantRouter.post("/leases/:id/terminate", authenticateToken, terminateLeaseAgreementById);

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
tenantRouter.post("/payments", authenticateToken, createTenantPayment);

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
tenantRouter.get("/payments/:id", authenticateToken, getTenantPaymentById);

/**
 * @swagger
 * /tenants/payments:
 *   get:
 *     summary: Get all payments for current tenant (paginated)
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
 */
tenantRouter.get("/payments", authenticateToken, getAllTenantPayments);

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
tenantRouter.delete("/payments/:id", authenticateToken, deleteTenantPaymentById);

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
tenantRouter.patch("/payments/:id", authenticateToken, updateTenantPaymentById);

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
tenantRouter.post("/payment-summary", authenticateToken, createPaymentSummary);

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
tenantRouter.get("/payment-summary/:id", authenticateToken, getPaymentSummaryById);

/**
 * @swagger
 * /tenants/payment-summary:
 *   get:
 *     summary: Get all payment summaries for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summaries retrieved successfully
 */
tenantRouter.get("/payment-summary", authenticateToken, getAllPaymentSummaries);

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
tenantRouter.delete("/payment-summary/:id", authenticateToken, deletePaymentSummaryById);

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
tenantRouter.patch("/payment-summary/:id", authenticateToken, updatePaymentSummaryById);


/*
// tenant applications
tenantRouter.post("/me/applications", (req,res)=> {})
tenantRouter.get("/me/application", (req,res)=> {})
tenantRouter.get("/me/application/:id", (req,res)=> {})
tenantRouter.patch("/me/application/:id", (req,res)=> {})
tenantRouter.delete("/me/application/:id", (req,res)=> {})

*/


export default tenantRouter 