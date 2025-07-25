import express from "express"
import { authenticateToken, requireTenant } from "../middleware/authMiddleware.js";
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
  getLeaseSettingById,
  createLeaseSetting,
  updateLeaseSettingById,
  deleteLeaseSettingById,
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
tenantRouter.patch("/", authenticateToken, requireTenant, updateTenant);

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
 * /tenants/lease-setting:
 *   patch:
 *     summary: Update lease setting for current tenant
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
 *     summary: Create a new payment method for current tenant
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentMethod'
 *     responses:
 *       201:
 *         description: Payment method created successfully
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
 */
tenantRouter.get("/payment-methods/:id", authenticateToken, requireTenant, getPaymentMethodById);

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
 *             $ref: '#/components/schemas/PaymentMethod'
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 */
tenantRouter.patch("/payment-methods/:id", authenticateToken, requireTenant, updatePaymentMethodById);

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
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
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
 * /tenants/lease-settings/{id}:
 *   get:
 *     summary: Get lease setting by ID for current tenant
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
 *         description: Lease setting retrieved successfully
 */
tenantRouter.get("/lease-settings/:id", authenticateToken, requireTenant, getLeaseSettingById);

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
 * /tenants/lease-settings/{id}:
 *   patch:
 *     summary: Update lease setting by ID for current tenant
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
 *               leaseSetting:
 *                 $ref: '#/components/schemas/Tenant/properties/leaseSetting'
 *     responses:
 *       200:
 *         description: Lease setting updated successfully
 */
tenantRouter.patch("/lease-settings/:id", authenticateToken, requireTenant, updateLeaseSettingById);

/**
 * @swagger
 * /tenants/lease-settings/{id}:
 *   delete:
 *     summary: Delete lease setting by ID for current tenant
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
 *         description: Lease setting deleted successfully
 */
tenantRouter.delete("/lease-settings/:id", authenticateToken, requireTenant, deleteLeaseSettingById);

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
 *     responses:
 *       200:
 *         description: Payment updated successfully
 */
tenantRouter.patch("/payments/:id", authenticateToken, requireTenant, updateTenantPaymentById);

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
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summaries retrieved successfully
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