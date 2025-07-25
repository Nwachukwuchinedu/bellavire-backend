import Tenant from "../models/Tenant.js";
import PaymentMethod from "../models/PaymentMethod.js";
import validator from "../validation/dynamicValidateAndSanitize.js";
import Property from "../models/Property.js";
import Maintenance from "../models/Maintenance.js";
import Lease from "../models/Lease.js";
import TenantPayment from "../models/TenantPayment.js";
import PaymentSummary from "../models/PaymentSummary.js";
import User from "../models/User.js";

// // Get current tenant profile
// export const getCurrentTenant = async (req, res) => {
//     try {
//         const tenant = await Tenant.findById(req.user.id);
//         if (!tenant) {
//             return res.status(404).json({
//                 status: false,
//                 message: "Tenant not found",
//             });
//         }
//         res.json({
//             status: true,
//             data: tenant,
//             message: "Tenant retrieved successfully",
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: false,
//             message: "Failed to retrieve tenant",
//             error: err.message
//         });
//     }
// };

// // Create a new tenant
// export const createTenant = async (req, res) => {
//     try {
//         const { value, error } = validator.validateForCreate(req.body, Tenant);
//         if (error) {
//             return res.status(400).json({
//                 status: false,
//                 message: "Validation failed",
//                 error: error.details
//             });
//         }
//         const tenant = new Tenant(value);
//         await tenant.save();
//         res.status(201).json({
//             status: true,
//             data: tenant,
//             message: "Tenant created successfully",
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: false,
//             message: "Failed to create tenant",
//             error: err.message
//         });
//     }
// };

// Update current tenant
export const updateTenant = async (req, res) => {
    const session = await Tenant.startSession();
    session.startTransaction();
    try {
        const { value, error } = validator.validateForUpdate(req.body, Tenant);
        if (error) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        // Update Tenant
        const tenant = await Tenant.findOneAndUpdate(
            { user: req.user.userId },
            value,
            { new: true, runValidators: true, session }
        );
        if (!tenant) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        // Update User personal details if present in request
        const personalFields = ["firstName", "lastName", "email", "phoneNumber"];
        const userUpdate = {};
        for (const field of personalFields) {
            if (value[field] !== undefined) {
                userUpdate[field] = value[field];
            }
        }
        let user;
        if (Object.keys(userUpdate).length > 0) {
            user = await User.findByIdAndUpdate(
                req.user.userId,
                userUpdate,
                { new: true, runValidators: true, session }
            );
        }
        await session.commitTransaction();
        session.endSession();
        res.json({
            status: true,
            message: "Tenant and user details updated successfully",
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
            status: false,
            message: "Failed to update tenant and user details",
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


/**
 * @swagger
 * /tenant/lease-setting:
 *   patch:
 *     summary: Update tenant lease setting
 *     description: Update one or more lease setting fields for the current tenant. Send the lease setting fields inside a 'leaseSetting' object in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaseSetting:
 *                 type: object
 *                 properties:
 *                   licenseReference:
 *                     type: string
 *                   leaseStartDate:
 *                     type: string
 *                     format: date-time
 *                   propertyName:
 *                     type: string
 *                   leaseEndDate:
 *                     type: string
 *                     format: date-time
 *                   accountType:
 *                     type: string
 *                   city:
 *                     type: string
 *                   currentProperty:
 *                     type: string
 *     responses:
 *       200:
 *         description: Lease setting updated successfully
 */
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
        if (!value.leaseSetting || typeof value.leaseSetting !== 'object') {
            return res.status(400).json({
                status: false,
                message: "Request body must include a 'leaseSetting' object with fields to update.",
                error: null
            });
        }
        const update = {};
        for (const key in value.leaseSetting) {
            update[`leaseSetting.${key}`] = value.leaseSetting[key];
        }
        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No valid leaseSetting fields provided",
                error: null
            });
        }
        const tenant = await Tenant.findOneAndUpdate(
            { user: req.user.userId },
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

/**
 * @swagger
 * /tenant/social-links:
 *   patch:
 *     summary: Update tenant social links
 *     description: Update one or more social link fields for the current tenant. Send the social link fields inside a 'socialLinks' object in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   google:
 *                     type: string
 *                   microsoft:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *                   instagram:
 *                     type: string
 *     responses:
 *       200:
 *         description: Social links updated successfully
 */
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
        if (!value.socialLinks || typeof value.socialLinks !== 'object') {
            return res.status(400).json({
                status: false,
                message: "Request body must include a 'socialLinks' object with fields to update.",
                error: null
            });
        }
        const update = {};
        for (const key in value.socialLinks) {
            update[`socialLinks.${key}`] = value.socialLinks[key];
        }
        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No valid socialLinks fields provided",
                error: null
            });
        }
        const tenant = await Tenant.findOneAndUpdate(
            { user: req.user.userId },
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

/**
 * @swagger
 * /tenant/notifications:
 *   patch:
 *     summary: Update tenant notification settings
 *     description: Update one or more notification settings for the current tenant. Send the notification fields inside a 'notifications' object in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   rentDueReminder:
 *                     type: boolean
 *                   maintenanceUpdates:
 *                     type: boolean
 *                   leaseRenewalNotices:
 *                     type: boolean
 *                   chatMessages:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Notifications updated successfully
 */
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
        if (!value.notifications || typeof value.notifications !== 'object') {
            return res.status(400).json({
                status: false,
                message: "Request body must include a 'notifications' object with fields to update.",
                error: null
            });
        }
        const update = {};
        for (const key in value.notifications) {
            update[`notifications.${key}`] = value.notifications[key];
        }
        if (Object.keys(update).length === 0) {
            return res.status(400).json({
                status: false,
                message: "No valid notification fields provided",
                error: null
            });
        }
        const tenant = await Tenant.findOneAndUpdate(
            { user: req.user.userId },
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


/**
 * @swagger
 * /tenants/payment-methods:
 *   post:
 *     summary: Add a Stripe payment method for the current tenant
 *     description: Save a Stripe payment method for the tenant. The frontend must send a valid Stripe payment method ID and Stripe customer ID. No card details are handled by the backend.
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
export const createPaymentMethod = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }
        const { stripePaymentMethodId, stripeCustomerId } = req.body;
        if (!stripePaymentMethodId || !stripeCustomerId) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "stripePaymentMethodId and stripeCustomerId are required",
                error: null
            });
        }
        // Save only what the frontend sends
        const paymentMethod = new PaymentMethod({
            tenant: tenant._id,
            stripeCustomerId,
            stripePaymentMethodId
        });
        await paymentMethod.save();
        res.status(201).json({
            status: true,
            data: paymentMethod,
            message: "Payment method added successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to add payment method",
            error: err.message
        });
    }
};

// Get all payment methods for the current tenant
export const getAllPaymentMethods = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }
        const paymentMethods = await PaymentMethod.find({ tenant: tenant._id });
        res.json({
            status: true,
            data: paymentMethods,
            message: "Payment methods retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve payment methods",
            error: err.message
        });
    }
};

// Get a single payment method by ID for the current tenant
export const getPaymentMethodById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }
        const paymentMethod = await PaymentMethod.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!paymentMethod) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Payment method not found or unauthorized",
                error: null
            });
        }
        res.json({
            status: true,
            data: paymentMethod,
            message: "Payment method retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve payment method",
            error: err.message
        });
    }
};

// Delete a payment method by ID for the current tenant (removes from Stripe and DB)
export const deletePaymentMethodById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }
        const paymentMethod = await PaymentMethod.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!paymentMethod) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Payment method not found or unauthorized",
                error: null
            });
        }
        // Detach from Stripe
        await paymentMethod.deleteOne();
        res.json({
            status: true,
            data: paymentMethod,
            message: "Payment method deleted successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to delete payment method",
            error: err.message
        });
    }
};

// Get all saved properties for the current tenant
export const getSavedProperties = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId }).populate("savedProperties");
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
        let tenant = await Tenant.findOne({ user: req.user.userId }).populate("savedProperties");
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
        // Only check for propertyId, do not validate against full Property schema
        const propertyId = req.body.propertyId || req.body._id || req.body.id;
        if (!propertyId) {
            return res.status(400).json({
                status: false,
                message: "Validation failed: propertyId is required and must be valid",
                error: "propertyId missing"
            });
        }
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                status: false,
                message: "Property not found",
            });
        }
        let tenant = await Tenant.findOne({ user: req.user.userId });
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
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

/**
 * @swagger
 * /tenant/maintenance:
 *   post:
 *     summary: Create a new maintenance request for the current tenant
 *     description: Create a new maintenance request. Fields like tenant, tenantName, tenantPhoneNumber, and tenantEmail are filled automatically by the backend.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - issue
 *               - date
 *               - category
 *               - status
 *               - propertyAddress
 *               - images
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
 *               status:
 *                 type: string
 *                 enum: [resolved, in progress, pending, failed]
 *                 default: "in progress"
 *                 example: "in progress"
 *                 description: Status of the maintenance (default: in progress)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["/uploads/maintenance1.jpg"]
 *                 description: Array of image URLs/paths
 *               propertyAddress:
 *                 type: string
 *                 example: "123 Main St, London, UK"
 *                 description: Address of the property
 *               description:
 *                 type: string
 *                 example: "The faucet in the kitchen has been leaking for two days."
 *                 description: Detailed description
 *           example:
 *             title: "Leaking faucet"
 *             issue: "The kitchen faucet is leaking."
 *             date: "2024-07-01T10:00:00Z"
 *             category: "plumbing"
 *             status: "in progress"
 *             images: ["/uploads/maintenance1.jpg"]
 *             propertyAddress: "123 Main St, London, UK"
 *             description: "The faucet in the kitchen has been leaking for two days."
 *     responses:
 *       201:
 *         description: Maintenance request created successfully
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
 */
// Create a new maintenance request for the current tenant
export const createMaintenance = async (req, res) => {
    try {
        // Collect file paths from uploaded files
        const imagePaths = req.files ? req.files.map(file => file.path || file.originalname) : [];
        // Merge with any images sent as text (optional)
        const images = [
            ...(req.body.images ? [].concat(req.body.images) : []),
            ...imagePaths
        ];
        // Attach tenant info from req.user
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        // Prepare data for validation, always default status to 'pending'
        const data = {
            ...req.body,
            images,
            tenant: tenant._id.toString(),
            tenantName: tenant.firstName,
            tenantPhoneNumber: tenant.phoneNumber,
            tenantEmail: tenant.email,
            status: 'pending'
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const maintenances = await Maintenance.find({ tenant: tenant._id });
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const maintenance = await Maintenance.findOne({ _id: req.params.id, tenant: tenant._id });
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
        // Collect file paths from uploaded files
        const imagePaths = req.files ? req.files.map(file => file.path || file.originalname) : [];
        // Merge with any images sent as text (optional)
        const images = [
            ...(req.body.images ? [].concat(req.body.images) : []),
            ...imagePaths
        ];
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        // Only allow status to be updated in patch
        const data = {
            ...req.body,
            images,
            tenant: tenant._id.toString(),
            tenantName: tenant.firstName,
            tenantPhoneNumber: tenant.phoneNumber,
            tenantEmail: tenant.email
        };
        const { value, error } = validator.validateForUpdate(data, Maintenance);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const maintenance = await Maintenance.findOneAndUpdate(
            { _id: req.params.id, tenant: tenant._id },
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const maintenance = await Maintenance.findOneAndDelete({ _id: req.params.id, tenant: tenant._id });
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
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
        const { value, error } = validator.validateForCreate(req.body, Tenant, {
            excludeFields: [
                "firstName", "lastName", "email", "phoneNumber", "country", "city", "religion", "gender", "maritalStatus", "numberOfChildren", "employmentStatus", "monthlyIncome", "employer", "address", "preferredLanguage", "socialLinks", "notifications", "savedProperties", "createdAt", "updatedAt"
            ]
        });
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        let tenant = await Tenant.findOne({ user: req.user.userId });
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
        const { value, error } = validator.validateForUpdate(req.body, Tenant, {
            excludeFields: [
                "firstName", "lastName", "email", "phoneNumber", "country", "city", "religion", "gender", "maritalStatus", "numberOfChildren", "employmentStatus", "monthlyIncome", "employer", "address", "preferredLanguage", "socialLinks", "notifications", "savedProperties", "createdAt", "updatedAt"
            ]
        });
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        let tenant = await Tenant.findOne({ user: req.user.userId });
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

// Get all leases for the current tenant
export const getLeaseAgreement = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }
        // Find all leases for the current tenant
        const leases = await Lease.find({ tenant: tenant._id });
        res.json({
            status: true,
            data: leases,
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }
        // Ensure the lease belongs to the current tenant
        const lease = await Lease.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found or unauthorized",
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }
        // Add tenant field as string before validation, but use ObjectId for Mongoose
        const { termination, ...rest } = req.body;
        const data = { ...rest, tenant: tenant._id.toString() };
        const { value, error } = validator.validateForCreate(data, Lease);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const lease = new Lease({ ...value, tenant: tenant._id });
        await lease.save();
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
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(403).json({
                status: false,
                message: "Unauthorized to update this lease",
            });
        }
        // Ensure the lease belongs to the current tenant
        const lease = await Lease.findOneAndUpdate(
            { _id: req.params.id, tenant: tenant._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found or unauthorized",
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

/**
 * @swagger
 * /tenants/leases/{id}/terminate:
 *   post:
 *     summary: Terminate a lease agreement by ID for current tenant
 *     description: Terminate a lease. If the lease is already terminated, an error will be returned. Only the reason is required; comment is optional.
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
 *       400:
 *         description: Lease is already terminated
 */
export const terminateLeaseAgreementById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(403).json({ status: false, message: "Unauthorized to terminate this lease" });
        }
        const { reason, comment, terminatedAt } = req.body;
        if (!reason) {
            return res.status(400).json({ status: false, message: "Termination reason is required" });
        }
        // Find the lease and check if already terminated
        const lease = await Lease.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!lease) {
            return res.status(404).json({ status: false, message: "Lease not found" });
        }
        if (lease.isTerminated) {
            return res.status(400).json({ status: false, message: "Lease is already terminated" });
        }
        lease.isTerminated = true;
        lease.termination = {
            reason,
            comment: comment || '',
            terminatedAt: terminatedAt || new Date()
        };
        await lease.save();
        res.json({
            status: true,
            data: lease,
            message: "Lease terminated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to terminate lease",
            error: err.message
        });
    }
};

// Get all payments for the current tenant (paginated)
export const getAllTenantPayments = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            TenantPayment.find({ tenant: tenant._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            TenantPayment.countDocuments({ tenant: tenant._id })
        ]);
        res.json({
            status: true,
            data: payments,
            total,
            page,
            pageSize: limit,
            message: "Payments retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve payments",
            error: err.message
        });
    }
};

// Get a single payment by ID for the current tenant
export const getTenantPaymentById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const payment = await TenantPayment.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!payment) {
            return res.status(404).json({
                status: false,
                message: "Payment not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: payment,
            message: "Payment retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve payment",
            error: err.message
        });
    }
};

// Create a new payment for the current tenant
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
 *             paymentMethod: "pm_1N..." # Stripe payment method ID
 *             receipt: { ... }
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
export const createTenantPayment = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }
        // Always set tenant as string for validation, but use ObjectId for Mongoose
        const data = { ...req.body, tenant: tenant._id.toString() };
        if (!data.paymentMethod) {
            return res.status(400).json({
                status: false,
                message: "Stripe payment method ID is required in paymentMethod field",
                error: "paymentMethod missing"
            });
        }
        if (data.receipt && data.receipt.property) {
            data.receipt.property = String(data.receipt.property);
        }
        const { value, error } = validator.validateForCreate(data, TenantPayment);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const payment = new TenantPayment({ ...value, tenant: tenant._id });
        await payment.save();
        res.status(201).json({
            status: true,
            data: payment,
            message: "Payment created successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to create payment",
            error: err.message
        });
    }
};

// Update a payment by ID for the current tenant
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
 *             paymentMethod: "pm_1N..." # Stripe payment method ID
 *             receipt: { ... }
 *     responses:
 *       200:
 *         description: Payment updated successfully
 */
export const updateTenantPaymentById = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, TenantPayment);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        if (value.paymentMethod && !value.paymentMethod.startsWith('pm_')) {
            return res.status(400).json({
                status: false,
                message: "paymentMethod must be a valid Stripe payment method ID (pm_...)"
            });
        }
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const payment = await TenantPayment.findOneAndUpdate(
            { _id: req.params.id, tenant: tenant._id },
            value,
            { new: true, runValidators: true }
        );
        if (!payment) {
            return res.status(404).json({
                status: false,
                message: "Payment not found or unauthorized",
            });
        }
        // Update paymentHistory
        tenant.paymentHistory.totalPayment = await TenantPayment.aggregate([
            { $match: { tenant: tenant._id, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(r => (r[0]?.total || 0));
        tenant.paymentHistory.lastPayment = await TenantPayment.findOne({ tenant: tenant._id, status: 'paid' }).sort({ 'receipt.datePaid': -1, createdAt: -1 }).then(p => p?.receipt?.datePaid || p?.createdAt);
        tenant.paymentHistory.pendingPayment = await TenantPayment.aggregate([
            { $match: { tenant: tenant._id, status: 'outstanding' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(r => (r[0]?.total || 0));
        await tenant.save();
        res.json({
            status: true,
            data: payment,
            message: "Payment updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to update payment",
            error: err.message
        });
    }
};

// Delete a payment by ID for the current tenant
export const deleteTenantPaymentById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const payment = await TenantPayment.findOneAndDelete({ _id: req.params.id, tenant: tenant._id });
        if (!payment) {
            return res.status(404).json({
                status: false,
                message: "Payment not found or unauthorized",
            });
        }
        // Update paymentSummary if needed (do not remove from payments array)
        tenant.paymentSummary = tenant.paymentSummary || {};
        tenant.paymentSummary.totalPayment = await TenantPayment.aggregate([
            { $match: { tenant: tenant._id, status: 'paid' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(r => (r[0]?.total || 0));
        tenant.paymentSummary.lastPayment = await TenantPayment.findOne({ tenant: tenant._id, status: 'paid' }).sort({ 'receipt.datePaid': -1, createdAt: -1 }).then(p => p?.receipt?.datePaid || p?.createdAt);
        tenant.paymentSummary.pendingPayment = await TenantPayment.aggregate([
            { $match: { tenant: tenant._id, status: 'outstanding' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(r => (r[0]?.total || 0));
        await tenant.save();
        res.json({
            status: true,
            data: payment,
            message: "Payment deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to delete payment",
            error: err.message
        });
    }
};

// Get all payment summaries for the current tenant
export const getAllPaymentSummaries = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const paymentSummaries = await PaymentSummary.find({ tenant: tenant._id }).sort({ dueDate: -1 });
        res.json({
            status: true,
            data: paymentSummaries,
            message: "Payment summaries retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve payment summaries",
            error: err.message
        });
    }
};

// Get a single payment summary by ID for the current tenant
export const getPaymentSummaryById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        const paymentSummary = await PaymentSummary.findOne({ _id: req.params.id, tenant: tenant._id });
        if (!paymentSummary) {
            return res.status(404).json({
                status: false,
                message: "Payment summary not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: paymentSummary,
            message: "Payment summary retrieved successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve payment summary",
            error: err.message
        });
    }
};

// Create a new payment summary for the current tenant
export const createPaymentSummary = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }
        // Always set tenant as string for validation, but use ObjectId for Mongoose
        const data = { ...req.body, tenant: tenant._id.toString() };
        const { value, error } = validator.validateForCreate(data, PaymentSummary);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        const paymentSummary = new PaymentSummary({ ...value, tenant: tenant._id });
        await paymentSummary.save();
        res.status(201).json({
            status: true,
            data: paymentSummary,
            message: "Payment summary created successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to create payment summary",
            error: err.message
        });
    }
};

// Update a payment summary by ID for the current tenant
export const updatePaymentSummaryById = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, PaymentSummary);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const paymentSummary = await PaymentSummary.findOneAndUpdate(
            { _id: req.params.id, tenant: tenant._id },
            value,
            { new: true, runValidators: true }
        );
        if (!paymentSummary) {
            return res.status(404).json({
                status: false,
                message: "Payment summary not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: paymentSummary,
            message: "Payment summary updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to update payment summary",
            error: err.message
        });
    }
};

// Delete a payment summary by ID for the current tenant
export const deletePaymentSummaryById = async (req, res) => {
    try {
        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        const paymentSummary = await PaymentSummary.findOneAndDelete({ _id: req.params.id, tenant: tenant._id });
        if (!paymentSummary) {
            return res.status(404).json({
                status: false,
                message: "Payment summary not found or unauthorized",
            });
        }
        res.json({
            status: true,
            data: paymentSummary,
            message: "Payment summary deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to delete payment summary",
            error: err.message
        });
    }
};



