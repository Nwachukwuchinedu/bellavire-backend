import express from "express"
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  // Tenant controllers
  getCurrentTenant,
  createTenant,
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
const tenantRouter = express.Router()

// Get current tenant profile
tenantRouter.get("/me",authenticateToken, getCurrentTenant);

// Create a new tenant
tenantRouter.post("/me",authenticateToken, createTenant);

// Update current tenant
tenantRouter.patch("/me",authenticateToken, updateTenant);

// Get all tenants
tenantRouter.get("/", getAllTenants);

// Update leaseSetting field 
tenantRouter.patch("/me/lease-setting",authenticateToken, updateLeaseSetting);

// Update socialLinks field 
tenantRouter.patch("/me/social-links",authenticateToken, updateSocialLinks);

// Update notifications field 
tenantRouter.patch("/me/notifications",authenticateToken, updateNotifications);


// Create a new payment method for the current tenant
tenantRouter.post("/me/payment-methods",authenticateToken, createPaymentMethod);

// Get all payment methods for the current tenant
tenantRouter.get("/me/payment-methods",authenticateToken, getAllPaymentMethods);

// Get a single payment method by ID for the current tenant
tenantRouter.get("/me/payment-methods/:id",authenticateToken, getPaymentMethodById);

// Update a payment method by ID for the current tenant
tenantRouter.patch("/me/payment-methods/:id",authenticateToken, updatePaymentMethodById);

// Delete a payment method by ID for the current tenant
tenantRouter.delete("/me/payment-methods/:id",authenticateToken, deletePaymentMethodById);

// tenants favourites list
// Get all saved properties for the current tenant
tenantRouter.get("/me/saved-properties", authenticateToken, getSavedProperties);

// Get a single saved property by ID for the current tenant
tenantRouter.get("/me/saved-properties/:id", authenticateToken, getSavedPropertyById);

// Add a property to the current tenant's saved properties
tenantRouter.post("/me/saved-properties", authenticateToken, addSavedProperty);

// Delete a property from the current tenant's saved properties
tenantRouter.delete("/me/saved-properties/:id", authenticateToken, removeSavedProperty);


// tenants metainances requests
// Create a new maintenance request for the current tenant
tenantRouter.post(
  "/me/maintenances",
  authenticateToken,
  upload.array('images', 10),
  createMaintenance
);

// Get a single maintenance request by ID for the current tenant
tenantRouter.get("/me/maintenances/:id", authenticateToken, getMaintenanceById);

// Get all maintenance requests for the current tenant
tenantRouter.get("/me/maintenances", authenticateToken, getAllMaintenances);

// Update a maintenance request by ID for the current tenant
tenantRouter.patch(
  "/me/maintenances/:id",
  authenticateToken,
  upload.array('images', 10),
  updateMaintenanceById
);

// Delete a maintenance request by ID for the current tenant
tenantRouter.delete("/me/maintenances/:id", authenticateToken, deleteMaintenanceById);


// tenants lease setting
// Get the lease setting for the current tenant
tenantRouter.get("/me/lease-settings", authenticateToken, getLeaseSetting);

// Get the lease setting by ID for the current tenant (ID is ignored)
tenantRouter.get("/me/lease-settings/:id", authenticateToken, getLeaseSettingById);

// Create/set the lease setting for the current tenant
tenantRouter.post("/me/lease-settings", authenticateToken, createLeaseSetting);

// Update the lease setting for the current tenant
tenantRouter.patch("/me/lease-settings/:id", authenticateToken, updateLeaseSettingById);

// Delete the lease setting for the current tenant
tenantRouter.delete("/me/lease-settings/:id", authenticateToken, deleteLeaseSettingById);


// tenants lease agreements
// Get all lease agreements for the current tenant
tenantRouter.get("/me/leases", authenticateToken, getLeaseAgreement);

// Get a single lease agreement by ID for the current tenant
tenantRouter.get("/me/leases/:id", authenticateToken, getLeaseAgreementById);

// Create a new lease agreement for the current tenant
tenantRouter.post("/me/leases", authenticateToken, createLeaseAgreement);

// Update a lease agreement by ID for the current tenant
tenantRouter.patch("/me/leases/:id", authenticateToken, updateLeaseAgreementById);

// Terminate a lease agreement by ID for the current tenant
tenantRouter.post("/me/leases/:id/terminate", authenticateToken, terminateLeaseAgreementById);


// tenants trasactions & payments
// Create a new payment for the current tenant
tenantRouter.post("/me/payments", authenticateToken, createTenantPayment);

// Get a single payment by ID for the current tenant
tenantRouter.get("/me/payments/:id", authenticateToken, getTenantPaymentById);

// Get all payments for the current tenant (paginated)
tenantRouter.get("/me/payments", authenticateToken, getAllTenantPayments);

// Delete a payment by ID for the current tenant
tenantRouter.delete("/me/payments/:id", authenticateToken, deleteTenantPaymentById);

// Update a payment by ID for the current tenant
tenantRouter.patch("/me/payments/:id", authenticateToken, updateTenantPaymentById);


// tenants payment summary 
// Create a new payment summary for the current tenant
tenantRouter.post("/me/payment-summary", authenticateToken, createPaymentSummary);

// Get a single payment summary by ID for the current tenant
tenantRouter.get("/me/payment-summary/:id", authenticateToken, getPaymentSummaryById);

// Get all payment summaries for the current tenant
tenantRouter.get("/me/payment-summary", authenticateToken, getAllPaymentSummaries);

// Delete a payment summary by ID for the current tenant
tenantRouter.delete("/me/payment-summary/:id", authenticateToken, deletePaymentSummaryById);

// Update a payment summary by ID for the current tenant
tenantRouter.patch("/me/payment-summary/:id", authenticateToken, updatePaymentSummaryById);


/*
// tenant applications
tenantRouter.post("/me/applications", (req,res)=> {})
tenantRouter.get("/me/application", (req,res)=> {})
tenantRouter.get("/me/application/:id", (req,res)=> {})
tenantRouter.patch("/me/application/:id", (req,res)=> {})
tenantRouter.delete("/me/application/:id", (req,res)=> {})

*/


export default tenantRouter 