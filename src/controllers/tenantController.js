import Tenant from "../models/Tenant.js";
import PaymentMethod from "../models/PaymentMethod.js";
import validator from "../validation/dynamicValidateAndSanitize.js";
import Property from "../models/Property.js";
import Maintenance from "../models/Maintenance.js";
import Lease from "../models/Lease.js";

// Get current tenant profile
export const getCurrentTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant,
            message: "Tenant retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve tenant",
            error: err.message
        });
    }
};

// Create a new tenant
export const createTenant = async (req, res) => {
    try {
        const { value, error } = validator.validateForCreate(req.body, Tenant);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const tenant = new Tenant(value);
        await tenant.save();
        res.status(201).json({
            status: true,
            data: tenant,
            message: "Tenant created successfully",
        });
    } catch (err) {
        res.status(400).json({
            status: false,
            message: "Failed to create tenant",
            error: err.message
        });
    }
};

// Update current tenant
export const updateTenant = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Tenant);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const tenant = await Tenant.findByIdAndUpdate(req.user.id, value, { new: true, runValidators: true });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant,
            message: "Tenant updated successfully",
        });
    } catch (err) {
        res.status(400).json({
            status: false,
            message: "Failed to update tenant",
            error: err.message
        });
    }
};

// Get all tenants
export const getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find();
        res.json({
            status: true,
            data: tenants,
            message: "Tenants retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve tenants",
            error: err.message
        });
    }
};


// Update leaseSetting field (partial update)
export const updateLeaseSetting = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Tenant);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const update = {};
        for (const key in value) {
            update[`leaseSetting.${key}`] = value[key];
        }
        const tenant = await Tenant.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true, runValidators: true }
        );
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }
        res.json({
            status: true,
            data: tenant,
            message: "Lease setting updated successfully",
        });
    } catch (err) {
        res.status(400).json({
            status: false,
            data: null,
            message: "Failed to update lease setting",
            error: err.message
        });
    }
};

// Update socialLinks field (partial update)
export const updateSocialLinks = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Tenant);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const update = {};
        for (const key in value) {
            update[`socialLinks.${key}`] = value[key];
        }
        const tenant = await Tenant.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true, runValidators: true }
        );
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }
        res.json({
            status: true,
            data: tenant,
            message: "Social links updated successfully",
            error: null
        });
    } catch (err) {
        res.status(400).json({
            status: false,
            data: null,
            message: "Failed to update social links",
            error: err.message
        });
    }
};

// Update notifications field (partial update)
export const updateNotifications = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Tenant);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const update = {};
        for (const key in value) {
            update[`notifications.${key}`] = value[key];
        }
        const tenant = await Tenant.findByIdAndUpdate(
            req.user.id,
            { $set: update },
            { new: true, runValidators: true }
        );
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant,
            message: "Notifications updated successfully",
            error: null
        });
    } catch (err) {
        res.status(400).json({
            status: false,
            message: "Failed to update notifications",
            error: err.message
        });
    }
};


// Create a new payment method for the current tenant
export const createPaymentMethod = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const { value, error } = validator.validateForCreate(req.body, PaymentMethod);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const paymentMethod = new PaymentMethod({
            ...value,
            tenant: tenant._id
        });
        await paymentMethod.save();
        res.status(201).json({
            status: true,
            data: paymentMethod,
            message: "Payment method created successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to create payment method",
            error: err.message
        });
    }
};

// Get all payment methods for the current tenant
export const getAllPaymentMethods = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const paymentMethods = await PaymentMethod.find({ tenant: tenant._id });
        res.json({
            status: true,
            data: paymentMethods,
            message: "Payment methods retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve payment methods",
            error: err.message
        });
    }
};

// Get a single payment method by ID for the current tenant
export const getPaymentMethodById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const paymentMethod = await PaymentMethod.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!paymentMethod) {
            return res.status(404).json({
                status: false,
                message: "Payment method not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: paymentMethod,
            message: "Payment method retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve payment method",
            error: err.message
        });
    }
};

// Update a payment method by ID for the current tenant
export const updatePaymentMethodById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const { value, error } = validator.validateForUpdate(req.body, PaymentMethod);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const paymentMethod = await PaymentMethod.findOneAndUpdate(
            { _id: req.params.id, tenant: tenant._id },
            value,
            { new: true, runValidators: true }
        );
        if (!paymentMethod) {
            return res.status(404).json({
                status: false,
                message: "Payment method not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: paymentMethod,
            message: "Payment method updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to update payment method",
            error: err.message
        });
    }
};

// Delete a payment method by ID for the current tenant
export const deletePaymentMethodById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const paymentMethod = await PaymentMethod.findOneAndDelete({ _id: req.params.id, tenant: tenant._id });
        if (!paymentMethod) {
            return res.status(404).json({
                status: false,
                message: "Payment method not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: paymentMethod,
            message: "Payment method deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to delete payment method",
            error: err.message
        });
    }
};

// Get all saved properties for the current tenant
export const getSavedProperties = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id).populate("savedProperties");
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant.savedProperties,
            message: "Saved properties retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve saved properties",
            error: err.message
        });
    }
};

// Get a single saved property by ID for the current tenant
export const getSavedPropertyById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id).populate("savedProperties");
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const property = tenant.savedProperties.find(
            (prop) => prop._id.toString() === req.params.id
        );
        if (!property) {
            return res.status(404).json({
                status: false,
                message: "Saved property not found",
            });
        }
        res.json({
            status: true,
            data: property,
            message: "Saved property retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve saved property",
            error: err.message
        });
    }
};

// Add a property to savedProperties for the current tenant
export const addSavedProperty = async (req, res) => {
    try {
        // Validate propertyId
        const { value, error } = validator.validateForCreate(req.body, Property, {
            excludeFields: [
                "propertyName", "propertyType", "address", "frontImage", "propertyImages", "description", "bedrooms", "bathrooms", "furnished", "amenities", "sharedAreas", "monthlyRent", "depositAmount", "tenancy", "availableFrom", "paymentFrequency", "addressLine1", "addressLine2", "cityOrTown", "postalCode", "regionOrCountry", "createdAt", "updatedAt"
            ]
        });
        const propertyId = req.body.propertyId || req.body._id || req.body.id;
        if (!propertyId || error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed: propertyId is required and must be valid",
                error: error ? error.details : "propertyId missing"
            });
        }
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                status: false,
                message: "Property not found",
            });
        }
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        if (tenant.savedProperties.includes(property._id)) {
            return res.status(409).json({
                status: false,
                message: "Property already saved",
            });
        }
        tenant.savedProperties.push(property._id);
        await tenant.save();
        res.status(201).json({
            status: true,
            data: tenant.savedProperties,
            message: "Property added to saved properties successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to add property to saved properties",
            error: err.message
        });
    }
};

// Remove a property from savedProperties for the current tenant
export const removeSavedProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const index = tenant.savedProperties.findIndex(
            (propId) => propId.toString() === propertyId
        );
        if (index === -1) {
            return res.status(404).json({
                status: false,
                message: "Property not found in saved properties",
            });
        }
        tenant.savedProperties.splice(index, 1);
        await tenant.save();
        res.json({
            status: true,
            data: tenant.savedProperties,
            message: "Property removed from saved properties successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to remove property from saved properties",
            error: err.message
        });
    }
};

// Create a new maintenance request for the current tenant
export const createMaintenance = async (req, res) => {
    try {
        // Attach tenant info from req.user
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const data = {
            ...req.body,
            tenant: tenant._id,
            tenantName: tenant.firstName + ' ' + tenant.lastName,
            tenantPhoneNumber: tenant.phoneNumber,
            tenantEmail: tenant.email
        };
        const { value, error } = validator.validateForCreate(data, Maintenance);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const maintenance = new Maintenance(value);
        await maintenance.save();
        res.status(201).json({
            status: true,
            data: maintenance,
            message: "Maintenance request created successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to create maintenance request",
            error: err.message
        });
    }
};

// Get all maintenance requests for the current tenant
export const getAllMaintenances = async (req, res) => {
    try {
        const maintenances = await Maintenance.find({ tenant: req.user.id });
        res.json({
            status: true,
            data: maintenances,
            message: "Maintenance requests retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve maintenance requests",
            error: err.message
        });
    }
};

// Get a single maintenance request by ID for the current tenant
export const getMaintenanceById = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOne({ _id: req.params.id, tenant: req.user.id });
        if (!maintenance) {
            return res.status(404).json({
                status: false,
                message: "Maintenance request not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: maintenance,
            message: "Maintenance request retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve maintenance request",
            error: err.message
        });
    }
};

// Update a maintenance request by ID for the current tenant
export const updateMaintenanceById = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Maintenance);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const maintenance = await Maintenance.findOneAndUpdate(
            { _id: req.params.id, tenant: req.user.id },
            value,
            { new: true, runValidators: true }
        );
        if (!maintenance) {
            return res.status(404).json({
                status: false,
                message: "Maintenance request not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: maintenance,
            message: "Maintenance request updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to update maintenance request",
            error: err.message
        });
    }
};

// Delete a maintenance request by ID for the current tenant
export const deleteMaintenanceById = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOneAndDelete({ _id: req.params.id, tenant: req.user.id });
        if (!maintenance) {
            return res.status(404).json({
                status: false,
                message: "Maintenance request not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: maintenance,
            message: "Maintenance request deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to delete maintenance request",
            error: err.message
        });
    }
};

// Get leaseSetting for the current tenant
export const getLeaseSetting = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant.leaseSetting,
            message: "Lease setting retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve lease setting",
            error: err.message
        });
    }
};

// Get leaseSetting by id (for current tenant, id is ignored)
export const getLeaseSettingById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant.leaseSetting,
            message: "Lease setting retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve lease setting",
            error: err.message
        });
    }
};

// Create/set leaseSetting for the current tenant
export const createLeaseSetting = async (req, res) => {
    try {
        const { value, error } = validator.validateForCreate(req.body, Tenant, { excludeFields: [
            "firstName", "lastName", "email", "phoneNumber", "country", "city", "religion", "gender", "maritalStatus", "numberOfChildren", "employmentStatus", "monthlyIncome", "employer", "address", "preferredLanguage", "socialLinks", "notifications", "savedProperties", "createdAt", "updatedAt"
        ] });
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        tenant.leaseSetting = value.leaseSetting;
        await tenant.save();
        res.status(201).json({
            status: true,
            data: tenant.leaseSetting,
            message: "Lease setting created successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to create lease setting",
            error: err.message
        });
    }
};

// Update leaseSetting for the current tenant
export const updateLeaseSettingById = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Tenant, { excludeFields: [
            "firstName", "lastName", "email", "phoneNumber", "country", "city", "religion", "gender", "maritalStatus", "numberOfChildren", "employmentStatus", "monthlyIncome", "employer", "address", "preferredLanguage", "socialLinks", "notifications", "savedProperties", "createdAt", "updatedAt"
        ] });
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        tenant.leaseSetting = { ...tenant.leaseSetting, ...value.leaseSetting };
        await tenant.save();
        res.json({
            status: true,
            data: tenant.leaseSetting,
            message: "Lease setting updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to update lease setting",
            error: err.message
        });
    }
};

// Delete leaseSetting for the current tenant
export const deleteLeaseSettingById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        tenant.leaseSetting = undefined;
        await tenant.save();
        res.json({
            status: true,
            data: null,
            message: "Lease setting deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to delete lease setting",
            error: err.message
        });
    }
};

// Get all leases for the current tenant
export const getLeaseAgreement = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.user.id).populate("leases");
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        res.json({
            status: true,
            data: tenant.leases,
            message: "Leases retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve leases",
            error: err.message
        });
    }
};

// Get a single lease by ID for the current tenant
export const getLeaseAgreementById = async (req, res) => {
    try {
        const lease = await Lease.findById(req.params.id);
        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found",
            });
        }
        // Ensure the lease belongs to the current tenant
        const tenant = await Tenant.findOne({ _id: req.user.id, leases: lease._id });
        if (!tenant) {
            return res.status(403).json({
                status: false,
                message: "Unauthorized to access this lease",
            });
        }
        res.json({
            status: true,
            data: lease,
            message: "Lease retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve lease",
            error: err.message
        });
    }
};

// Create a new lease for the current tenant
export const createLeaseAgreement = async (req, res) => {
    try {
        const { value, error } = validator.validateForCreate(req.body, Lease);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const lease = new Lease(value);
        await lease.save();
        // Add lease to tenant's leases array
        const tenant = await Tenant.findById(req.user.id);
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        tenant.leases.push(lease._id);
        await tenant.save();
        res.status(201).json({
            status: true,
            data: lease,
            message: "Lease created successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to create lease",
            error: err.message
        });
    }
};

// Update a lease by ID for the current tenant
export const updateLeaseAgreementById = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Lease);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        // Ensure the lease belongs to the current tenant
        const tenant = await Tenant.findOne({ _id: req.user.id, leases: req.params.id });
        if (!tenant) {
            return res.status(403).json({
                status: false,
                message: "Unauthorized to update this lease",
            });
        }
        const lease = await Lease.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found",
            });
        }
        res.json({
            status: true,
            data: lease,
            message: "Lease updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to update lease",
            error: err.message
        });
    }
};

// Delete a lease by ID for the current tenant
export const deleteLeaseAgreementById = async (req, res) => {
    try {
        // Ensure the lease belongs to the current tenant
        const tenant = await Tenant.findOne({ _id: req.user.id, leases: req.params.id });
        if (!tenant) {
            return res.status(403).json({
                status: false,
                message: "Unauthorized to delete this lease",
            });
        }
        const lease = await Lease.findByIdAndDelete(req.params.id);
        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found",
            });
        }
        // Remove lease from tenant's leases array
        tenant.leases = tenant.leases.filter(lid => lid.toString() !== req.params.id);
        await tenant.save();
        res.json({
            status: true,
            data: lease,
            message: "Lease deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to delete lease",
            error: err.message
        });
    }
};


