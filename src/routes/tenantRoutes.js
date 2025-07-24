import express from "express"
import Tenant from "../models/Tenant.js";
import PaymentMethod from "../models/PaymentMethod.js";
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
  deletePaymentMethodById
} from "../controllers/auth/tenantController.js";
const tenantRouter = express.Router()

// Get current tenant profile
tenantRouter.get("/me", getCurrentTenant);

// Create a new tenant
tenantRouter.post("/me", createTenant);

// Update current tenant
tenantRouter.patch("/me", updateTenant);

// Get all tenants
tenantRouter.get("/", getAllTenants);

// Update leaseSetting field 
tenantRouter.patch("/me/lease-setting", updateLeaseSetting);

// Update socialLinks field 
tenantRouter.patch("/me/social-links", updateSocialLinks);

// Update notifications field 
tenantRouter.patch("/me/notifications", updateNotifications);


// Create a new payment method for the current tenant
tenantRouter.post("/me/payment-methods", createPaymentMethod);

// Get all payment methods for the current tenant
tenantRouter.get("/me/payment-methods", getAllPaymentMethods);

// Get a single payment method by ID for the current tenant
tenantRouter.get("/me/payment-methods/:id", getPaymentMethodById);

// Update a payment method by ID for the current tenant
tenantRouter.patch("/me/payment-methods/:id", updatePaymentMethodById);

// Delete a payment method by ID for the current tenant
tenantRouter.delete("/me/payment-methods/:id", deletePaymentMethodById);

// tenants favourites list
tenantRouter.get("/me/saved-properties", (req,res)=> {})
tenantRouter.get("/me/saved-properties/:id", (req,res)=> {})
tenantRouter.post("/me/saved-properties", (req,res)=> {})
tenantRouter.patch("/me/saved-properties/:id", (req,res)=> {})
tenantRouter.delete("/me/saved-properties/:id", (req,res)=> {})


/*
// tenant applications
tenantRouter.post("/me/applications", (req,res)=> {})
tenantRouter.get("/me/application", (req,res)=> {})
tenantRouter.get("/me/application/:id", (req,res)=> {})
tenantRouter.patch("/me/application/:id", (req,res)=> {})
tenantRouter.delete("/me/application/:id", (req,res)=> {})

// tenants lease setting
tenantRouter.get("/me/lease-settings", (req,res)=> {})
tenantRouter.get("/me/lease-settings/:id", (req,res)=> {})
tenantRouter.post("/me/lease-settings", (req,res)=> {})
tenantRouter.patch("/me/lease-settings/:id", (req,res)=> {})
tenantRouter.delete("/me/lease-settings/:id", (req,res)=> {})

// tenants rent payments 
tenantRouter.get("/me/rent-payments", (req,res)=> {})
tenantRouter.get("/me/rent-payments/:id", (req,res)=> {})
tenantRouter.patch("/me/rent-payments/:id", (req,res)=> {})
tenantRouter.delete("/me/rent-payments/:id", (req,res)=> {})
tenantRouter.post("/me/rent-payments", (req,res)=> {})
tenantRouter.put("/me/rent-payments/:id", (req,res)=> {})

// tenants trasactions & payments
tenantRouter.post("/me/payments", (req,res)=> {})
tenantRouter.get("/me/payments/:id", (req,res)=> {})
tenantRouter.get("/me/payments", (req,res)=> {})
tenantRouter.delete("/me/payments/:id", (req,res)=> {})
tenantRouter.patch("/me/payments/:id", (req,res)=> {})

// tenants metainances requests
tenantRouter.post("/me/maintenances", (req,res)=> {})
tenantRouter.get("/me/maintenances/:id", (req,res)=> {})
tenantRouter.get("/me/maintenances", (req,res)=> {})
tenantRouter.patch("/me/maintenances/:id", ()=> {})
tenantRouter.delete("/me/maintenances/:id", ()=> {})

// tenants lease agreements
tenantRouter.get("/me/leases", (req,res)=> {})
tenantRouter.get("/me/leases/:id", (req,res)=> {})
tenantRouter.post("/me/leases", (req,res)=> {})
tenantRouter.patch("/me/leases/:id", (req,res)=> {})
tenantRouter.delete("/me/leases/:id", (req,res)=> {})
*/


export default tenantRouter 