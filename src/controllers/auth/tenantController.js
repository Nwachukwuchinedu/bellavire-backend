import Tenant from "../../models/Tenant.js";
import PaymentMethod from "../../models/PaymentMethod.js";
import validator from "../../validation/dynamicValidateAndSanitize.js";

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
