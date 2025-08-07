import mongoose from "mongoose";
import path from "path";
import Tenant from "../models/Tenant.js";
import PaymentMethod from "../models/PaymentMethod.js";
import validator from "../validation/dynamicValidateAndSanitize.js";
import Property from "../models/Property.js";
import Room from "../models/Room.js";
import Maintenance from "../models/Maintenance.js";
import Lease from "../models/Lease.js";
import TenantPayment from "../models/TenantPayment.js";
import PaymentSummary from "../models/PaymentSummary.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Landlord from "../models/Landlord.js";
import TenantApplication from "../models/TenantApplication.js";
import RentalHistory from "../models/RentalHistory.js";
import { uploads } from "../utils/fileUtils.js";
import { sendEmail } from "../services/emailService.js";
import { createTourNotificationEmail } from "../templates/tourNotification.js";
import { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    getUnreadNotificationCount,
    createNotification,
    sendEmailNotification
} from '../services/notificationService.js';
import { createMaintenanceNotificationEmail } from '../templates/tenantNotification.js';
import { createMaintenanceNotificationEmail as createLandlordMaintenanceEmail, createTourNotificationEmail as createLandlordTourEmail } from '../templates/landlordNotification.js';
import { createAgentInquiryEmail, createTenantConfirmationEmail } from '../templates/agentContact.js';
import { createNewApplicationEmail } from '../templates/applicationNotification.js';
import socialMediaService from '../services/socialMediaService.js';
import { getPlatformConfig } from '../config/socialMediaConfig.js';
import documentService from '../services/documentService.js';
import paymentService from '../services/paymentService.js';

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
 *                     type: object
 *                     properties:
 *                       sms:
 *                         type: boolean
 *                         description: Receive rent due reminders via SMS
 *                       email:
 *                         type: boolean
 *                         description: Receive rent due reminders via email
 *                   maintenanceUpdates:
 *                     type: object
 *                     properties:
 *                       sms:
 *                         type: boolean
 *                         description: Receive maintenance updates via SMS
 *                       email:
 *                         type: boolean
 *                         description: Receive maintenance updates via email
 *                   leaseRenewalNotices:
 *                     type: object
 *                     properties:
 *                       sms:
 *                         type: boolean
 *                         description: Receive lease renewal notices via SMS
 *                       email:
 *                         type: boolean
 *                         description: Receive lease renewal notices via email
 *                   chatMessages:
 *                     type: object
 *                     properties:
 *                       sms:
 *                         type: boolean
 *                         description: Receive chat message notifications via SMS
 *                       email:
 *                         type: boolean
 *                         description: Receive chat message notifications via email
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

        // Validate notification structure
        const validNotificationTypes = ['rentDueReminder', 'maintenanceUpdates', 'leaseRenewalNotices', 'chatMessages'];
        const validChannels = ['sms', 'email'];

        for (const notificationType in value.notifications) {
            if (!validNotificationTypes.includes(notificationType)) {
                return res.status(400).json({
                    status: false,
                    message: `Invalid notification type: ${notificationType}. Valid types are: ${validNotificationTypes.join(', ')}`,
                    error: null
                });
            }

            const notificationSettings = value.notifications[notificationType];
            if (typeof notificationSettings !== 'object' || notificationSettings === null) {
                return res.status(400).json({
                    status: false,
                    message: `${notificationType} must be an object with 'sms' and/or 'email' properties`,
                    error: null
                });
            }

            for (const channel in notificationSettings) {
                if (!validChannels.includes(channel)) {
                    return res.status(400).json({
                        status: false,
                        message: `Invalid channel for ${notificationType}: ${channel}. Valid channels are: ${validChannels.join(', ')}`,
                        error: null
                    });
                }

                if (typeof notificationSettings[channel] !== 'boolean') {
                    return res.status(400).json({
                        status: false,
                        message: `${notificationType}.${channel} must be a boolean value`,
                        error: null
                    });
                }
            }
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - issue
 *               - category
 *               - landlordId
 *               - propertyId
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
 *               landlordId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cb"
 *                 description: Landlord ID
 *               propertyId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cc"
 *                 description: Property ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files
 *           example:
 *             issue: "The kitchen faucet is leaking."
 *             category: "plumbing"
 *             description: "The faucet in the kitchen has been leaking for two days."
 *             landlordId: "60d0fe4f5311236168a109cb"
 *             propertyId: "60d0fe4f5311236168a109cc"
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
        // Upload files and get their paths
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const fileInfo = await uploads(file.buffer, file.originalname, 'personal');
                    imagePaths.push(fileInfo.path);
                } catch (error) {
                    return res.status(400).json({
                        status: false,
                        message: `Failed to upload file ${file.originalname}: ${error.message}`,
                        error: error.message
                    });
                }
            }
        }
        
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
        
        // Get the maintenance with populated data
        const populatedMaintenance = await Maintenance.findById(maintenance._id)
            .populate('landlordId', 'firstName lastName')
            .populate('propertyId', 'address')
            .populate('tenant', 'firstName lastName phoneNumber email');
        
        // Create notification for tenant
        try {
            await createNotification({
                recipientId: tenant._id,
                userRole: 'tenant',
                type: 'maintenance_created',
                message: `Your maintenance request for "${value.issue}" has been submitted successfully.`,
                link: `/maintenances/${maintenance._id}`
            });

            // Send email notification if tenant has email notifications enabled
            const emailTemplate = createMaintenanceNotificationEmail('created', {
                issue: value.issue,
                category: value.category,
                status: value.status,
                propertyAddress: populatedMaintenance.propertyId?.address || 'N/A',
                landlordName: populatedMaintenance.landlordId ? 
                    `${populatedMaintenance.landlordId.firstName} ${populatedMaintenance.landlordId.lastName}` : 'N/A'
            });

            await sendEmailNotification({
                recipientId: tenant._id,
                userRole: 'tenant',
                notificationType: 'maintenanceUpdates',
                subject: emailTemplate.subject,
                htmlContent: emailTemplate.html
            });
        } catch (notificationError) {
            console.error('Error creating maintenance notification:', notificationError);
            // Don't fail the request if notification fails
        }

        // Create notification for landlord about new maintenance request
        try {
            await createNotification({
                recipientId: populatedMaintenance.landlordId._id,
                userRole: 'landlord',
                type: 'maintenance_new_request',
                message: `New maintenance request from ${tenant.firstName} ${tenant.lastName} for ${populatedMaintenance.propertyId?.address || 'N/A'}`,
                link: `/maintenances/${maintenance._id}`
            });

            // Send email notification if landlord has email notifications enabled
            const landlordEmailTemplate = createLandlordMaintenanceEmail('new_request', {
                issue: value.issue,
                category: value.category,
                status: value.status,
                propertyAddress: populatedMaintenance.propertyId?.address || 'N/A',
                tenantName: `${tenant.firstName} ${tenant.lastName}`,
                maintenanceId: maintenance._id
            });

            await sendEmailNotification({
                recipientId: populatedMaintenance.landlordId._id,
                userRole: 'landlord',
                notificationType: 'maintenanceNewRequest',
                subject: landlordEmailTemplate.subject,
                htmlContent: landlordEmailTemplate.html
            });
        } catch (landlordNotificationError) {
            console.error('Error creating landlord maintenance notification:', landlordNotificationError);
            // Don't fail the request if notification fails
        }
        
        // Create a clean response with only the fields we want
        const transformedMaintenance = {
            _id: populatedMaintenance._id,
            issue: populatedMaintenance.issue,
            category: populatedMaintenance.category,
            status: populatedMaintenance.status,
            images: populatedMaintenance.images,
            description: populatedMaintenance.description,
            contractor: populatedMaintenance.contractor,
            createdAt: populatedMaintenance.createdAt,
            updatedAt: populatedMaintenance.updatedAt,
            __v: populatedMaintenance.__v,
            // Add the flattened fields
            landlordName: populatedMaintenance.landlordId ? 
                `${populatedMaintenance.landlordId.firstName} ${populatedMaintenance.landlordId.lastName}` : null,
            propertyAddress: populatedMaintenance.propertyId ? 
                populatedMaintenance.propertyId.address : null,
            tenantName: populatedMaintenance.tenant ? 
                `${populatedMaintenance.tenant.firstName} ${populatedMaintenance.tenant.lastName}` : null,
            tenantPhoneNumber: populatedMaintenance.tenant ? 
                populatedMaintenance.tenant.phoneNumber : null,
            tenantEmail: populatedMaintenance.tenant ? 
                populatedMaintenance.tenant.email : null
        };
        
        res.status(201).json({
            status: true,
            data: transformedMaintenance,
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
        const maintenances = await Maintenance.find({ tenant: tenant._id })
            .populate('landlordId', 'firstName lastName')
            .populate('propertyId', 'address')
            .populate('tenant', 'firstName lastName phoneNumber email');
        
        // Transform the response to include concatenated names and property address
        const transformedMaintenances = maintenances.map(maintenance => ({
            _id: maintenance._id,
            issue: maintenance.issue,
            category: maintenance.category,
            status: maintenance.status,
            images: maintenance.images,
            description: maintenance.description,
            contractor: maintenance.contractor,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
            __v: maintenance.__v,
            // Add the flattened fields
            landlordName: maintenance.landlordId ? 
                `${maintenance.landlordId.firstName} ${maintenance.landlordId.lastName}` : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null,
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null
        }));
        
        res.json({
            status: true,
            data: transformedMaintenances,
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
        const maintenance = await Maintenance.findOne({ _id: req.params.id, tenant: tenant._id })
            .populate('landlordId', 'firstName lastName')
            .populate('propertyId', 'address')
            .populate('tenant', 'firstName lastName phoneNumber email');
        
        if (!maintenance) {
            return res.status(404).json({
                status: false,
                message: "Maintenance request not found or unauthorized",
            });
        }
        
        // Transform the response to include concatenated names and property address
        const transformedMaintenance = {
            ...maintenance.toObject(),
            landlordName: maintenance.landlordId ? 
                `${maintenance.landlordId.firstName} ${maintenance.landlordId.lastName}` : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null,
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null
        };
        
        // Remove the nested objects and keep only the flattened fields
        delete transformedMaintenance.tenant;
        delete transformedMaintenance.landlordId;
        delete transformedMaintenance.propertyId;
        
        res.json({
            status: true,
            data: transformedMaintenance,
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
        // Upload files and get their paths
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const fileInfo = await uploads(file.buffer, file.originalname, 'personal');
                    imagePaths.push(fileInfo.path);
                } catch (error) {
                    return res.status(400).json({
                        status: false,
                        message: `Failed to upload file ${file.originalname}: ${error.message}`,
                        error: error.message
                    });
                }
            }
        }
        
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
        // Only allow certain fields to be updated by tenants (not status or contractor)
        const allowedFields = ['issue', 'description', 'images', 'category'];
        const filteredData = {};
        
        // Only include allowed fields
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                filteredData[field] = req.body[field];
            }
        }
        
        // Add images from file uploads
        if (images.length > 0) {
            filteredData.images = images;
        }
        
        // Add tenant info (these should not be changed by tenant)
        filteredData.tenant = tenant._id.toString();
        filteredData.tenantName = tenant.firstName;
        filteredData.tenantPhoneNumber = tenant.phoneNumber;
        filteredData.tenantEmail = tenant.email;
        const { value, error } = validator.validateForUpdate(filteredData, Maintenance);
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
        
        // Populate the response with landlord and property details
        const populatedMaintenance = await Maintenance.findById(maintenance._id)
            .populate('landlordId', 'firstName lastName')
            .populate('propertyId', 'address')
            .populate('tenant', 'firstName lastName phoneNumber email');
        
        // Transform the response to include concatenated names and property address
        const transformedMaintenance = {
            ...populatedMaintenance.toObject(),
            landlordName: populatedMaintenance.landlordId ? 
                `${populatedMaintenance.landlordId.firstName} ${populatedMaintenance.landlordId.lastName}` : null,
            propertyAddress: populatedMaintenance.propertyId ? 
                populatedMaintenance.propertyId.address : null,
            tenantName: populatedMaintenance.tenant ? 
                `${populatedMaintenance.tenant.firstName} ${populatedMaintenance.tenant.lastName}` : null,
            tenantPhoneNumber: populatedMaintenance.tenant ? 
                populatedMaintenance.tenant.phoneNumber : null,
            tenantEmail: populatedMaintenance.tenant ? 
                populatedMaintenance.tenant.email : null
        };
        
        // Remove the nested objects and keep only the flattened fields
        delete transformedMaintenance.tenant;
        delete transformedMaintenance.landlordId;
        delete transformedMaintenance.propertyId;
        
        res.json({
            status: true,
            data: transformedMaintenance,
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
        
        // First get the maintenance with populated data before deletion
        const maintenance = await Maintenance.findOne({ _id: req.params.id, tenant: tenant._id })
            .populate('landlordId', 'firstName lastName')
            .populate('propertyId', 'address')
            .populate('tenant', 'firstName lastName phoneNumber email');
            
        if (!maintenance) {
            return res.status(404).json({
                status: false,
                message: "Maintenance request not found or unauthorized",
            });
        }
        
        // Transform the response to include concatenated names and property address
        const transformedMaintenance = {
            ...maintenance.toObject(),
            landlordName: maintenance.landlordId ? 
                `${maintenance.landlordId.firstName} ${maintenance.landlordId.lastName}` : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null,
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null
        };
        
        // Remove the nested objects and keep only the flattened fields
        delete transformedMaintenance.tenant;
        delete transformedMaintenance.landlordId;
        delete transformedMaintenance.propertyId;
        
        // Now delete the maintenance
        await Maintenance.findByIdAndDelete(maintenance._id);
        
        res.json({
            status: true,
            data: transformedMaintenance,
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
        const leases = await Lease.find({ tenantId: tenant._id });
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
        const lease = await Lease.findOne({ _id: req.params.id, tenantId: tenant._id });
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
// Create a new lease for the current tenant
export const createLeaseAgreement = async (req, res) => {
    try {
        // Upload lease document if provided
        let leaseDocumentPath = null;
        if (req.file) {
            try {
                const fileInfo = await uploads(req.file.buffer, req.file.originalname, 'personal');
                leaseDocumentPath = fileInfo.path;
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    message: `Failed to upload lease document: ${error.message}`,
                    error: error.message
                });
            }
        }

        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({ status: false, message: "Tenant not found" });
        }

        // Prepare data for validation, including uploaded file path
        const { termination, ...rest } = req.body;
        const data = { 
            ...rest, 
            tenantId: tenant._id.toString(),
            leaseDocument: leaseDocumentPath
        };

        const { value, error } = validator.validateForCreate(data, Lease);
        if (error) {
            return res.status(400).json({
                status: false,
                message: "Validation failed",
                error: error.details
            });
        }

        const lease = new Lease({ ...value, tenantId: tenant._id });
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
// Update a lease by ID for the current tenant
export const updateLeaseAgreementById = async (req, res) => {
    try {
        // Upload lease document if provided
        let leaseDocumentPath = null;
        if (req.file) {
            try {
                const fileInfo = await uploads(req.file.buffer, req.file.originalname, 'personal');
                leaseDocumentPath = fileInfo.path;
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    message: `Failed to upload lease document: ${error.message}`,
                    error: error.message
                });
            }
        }

        let tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(403).json({
                status: false,
                message: "Unauthorized to update this lease",
            });
        }

        // Prepare update data, including uploaded file path if provided
        const updateData = { ...req.body };
        if (leaseDocumentPath) {
            updateData.leaseDocument = leaseDocumentPath;
        }

        // Filter out invalid ObjectId fields and empty strings
        const allowedFields = ['startDate', 'expirationDate', 'duration', 'status', 'currentProperty', 'streetName', 'rent', 'apartment', 'city', 'zipCode', 'leaseDocument'];
        const filteredUpdateData = {};
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined && updateData[field] !== '') {
                filteredUpdateData[field] = updateData[field];
            }
        }

        // Validate ObjectId fields if provided
        if (updateData.landlordId && updateData.landlordId.trim() !== '') {
            if (!mongoose.Types.ObjectId.isValid(updateData.landlordId)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid landlordId format",
                    error: "landlordId must be a valid ObjectId"
                });
            }
            filteredUpdateData.landlordId = updateData.landlordId;
        }

        if (updateData.propertyId && updateData.propertyId.trim() !== '') {
            if (!mongoose.Types.ObjectId.isValid(updateData.propertyId)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid propertyId format",
                    error: "propertyId must be a valid ObjectId"
                });
            }
            filteredUpdateData.propertyId = updateData.propertyId;
        }

        // Ensure the lease belongs to the current tenant
        const lease = await Lease.findOneAndUpdate(
            { _id: req.params.id, tenantId: tenant._id },
            filteredUpdateData,
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
        const lease = await Lease.findOne({ _id: req.params.id, tenantId: tenant._id });
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

        // Create rental history record when lease is terminated
        try {
            // Get landlord information
            const landlord = await Landlord.findById(lease.landlordId);
            const landlordName = landlord ? `${landlord.firstName} ${landlord.lastName}` : 'Unknown Landlord';

            // Create rental history record
            const rentalHistory = new RentalHistory({
                tenant: req.user.userId,
                previousLandlord: landlordName,
                rentalDates: {
                    startDate: lease.startDate,
                    endDate: lease.expirationDate
                },
                reasonForLeaving: reason,
                rentAmount: lease.rent,
                propertyAddress: `${lease.streetName}, ${lease.city}, ${lease.zipCode}`
            });
            await rentalHistory.save();

            console.log(`Rental history created for terminated lease: ${lease._id}`);
        } catch (rentalHistoryError) {
            console.error('Error creating rental history for terminated lease:', rentalHistoryError);
            // Don't fail the lease termination if rental history creation fails
        }

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
        
        // Get paginated payments and total count
        const [payments, total] = await Promise.all([
            TenantPayment.find({ tenant: tenant._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            TenantPayment.countDocuments({ tenant: tenant._id })
        ]);
        
        // Calculate payment summary statistics
        const [totalPayment, lastPayment, pendingPayment] = await Promise.all([
            // Total paid amount
            TenantPayment.aggregate([
                { $match: { tenant: tenant._id, status: 'paid' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]).then(r => (r[0]?.total || 0)),
            
            // Last payment date
            TenantPayment.findOne({ tenant: tenant._id, status: 'paid' })
                .sort({ 'receipt.datePaid': -1, createdAt: -1 })
                .then(p => p?.receipt?.datePaid || p?.createdAt || null),
            
            // Pending payment amount
            TenantPayment.aggregate([
                { $match: { tenant: tenant._id, status: { $in: ['pending', 'outstanding'] } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]).then(r => (r[0]?.total || 0))
        ]);
        
        res.json({
            status: true,
            data: payments,
            total,
            page,
            pageSize: limit,
            summary: {
                totalPayment,
                lastPayment,
                pendingPayment
            },
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
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
            });
        }
        
        const paymentSummaries = await PaymentSummary.find({ tenant: tenant._id }).sort({ dueDate: -1 });
        
        // Calculate overdue and missed payments
        const currentDate = new Date();
        let overdueAmount = 0;
        let missedAmount = 0;
        let overdueCount = 0;
        let missedPayments = [];
        
        paymentSummaries.forEach(summary => {
            const dueDate = new Date(summary.dueDate);
            const isOverdue = dueDate < currentDate;
            const isNotPaid = summary.status === 'outstanding' || summary.action === 'unpaid' || summary.action === 'missed' || summary.action === 'over-due';
            
            if (isOverdue && isNotPaid) {
                overdueAmount += summary.amount;
                overdueCount++;
            }
            
            if (summary.action === 'missed' || summary.action === 'over-due') {
                missedAmount += summary.amount;
                missedPayments.push({
                    id: summary._id,
                    description: summary.description,
                    dueDate: summary.dueDate,
                    amount: summary.amount,
                    duration: summary.duration,
                    status: summary.status,
                    action: summary.action
                });
            }
        });
        
        res.json({
            status: true,
            data: paymentSummaries,
            summary: {
                overduePayments: {
                    count: overdueCount,
                    amount: overdueAmount
                },
                missedPayments: {
                    count: missedPayments.length,
                    amount: missedAmount,
                    payments: missedPayments
                },
                totalPayments: paymentSummaries.length
            },
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

// ==================== TOUR FUNCTIONS ====================

// Request a property tour
export const requestTour = async (req, res) => {
    try {
        const { propertyId, date, timeSlot } = req.body;
        const tenantId = req.user.userId;

        // Validate required fields
        if (!propertyId || !date || !timeSlot) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Property ID, date, and time slot are required',
                error: 'Missing required fields'
            });
        }

        // Validate date is in the future
        const tourDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (tourDate < today) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Tour date must be in the future',
                error: 'Invalid date'
            });
        }

        // Get property details to find landlord
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Property not found',
                error: 'Property not found'
            });
        }

        // Find tenant record using user ID
        const tenant = await Tenant.findOne({ user: tenantId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tenant profile not found',
                error: 'Tenant not found'
            });
        }

        // Note: availableFrom represents rental availability, not tour availability
        // Tours are allowed regardless of rental availability date
        // This allows tenants to view properties before they become available for rent

        // Check if tenant already has a pending tour for this property
        const existingTour = await Tour.findOne({
            tenant: tenant._id,
            property: propertyId,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingTour) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'You already have a tour request for this property',
                error: 'Duplicate tour request'
            });
        }

        // Calculate start and end times for the requested tour
        const tourDuration = 30; // Default duration
        const [startHour, startMinute] = timeSlot.split(':').map(Number);
        const startTime = new Date(tourDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + tourDuration);

        // Check for time conflicts with existing tours
        const existingTours = await Tour.find({
            property: propertyId,
            date: tourDate,
            status: { $in: ['pending', 'confirmed'] }
        });

        // Check for time conflicts
        for (const existingTour of existingTours) {
            const [existingStartHour, existingStartMinute] = existingTour.timeSlot.split(':').map(Number);
            const existingStartTime = new Date(tourDate);
            existingStartTime.setHours(existingStartHour, existingStartMinute, 0, 0);
            
            const existingEndTime = new Date(existingStartTime);
            existingEndTime.setMinutes(existingEndTime.getMinutes() + (existingTour.duration || 30));

            // Check if there's a time overlap
            // Conflict occurs when:
            // - Requested start time is before existing end time AND
            // - Requested end time is after existing start time
            if (startTime < existingEndTime && endTime > existingStartTime) {
                return res.status(409).json({
                    status: false,
                    data: null,
                    message: `Time conflict detected. The requested tour time (${timeSlot} for ${tourDuration} minutes) overlaps with an existing tour. Please choose a different time.`,
                    error: 'Time conflict',
                    conflictDetails: {
                        requestedTime: {
                            start: startTime.toLocaleTimeString(),
                            end: endTime.toLocaleTimeString(),
                            duration: tourDuration
                        },
                        conflictingTour: {
                            start: existingStartTime.toLocaleTimeString(),
                            end: existingEndTime.toLocaleTimeString(),
                            duration: existingTour.duration || 30
                        }
                    }
                });
            }
        }

        // Create tour request
        const tour = new Tour({
            landlord: property.landlord, // Use the landlord ID from property
            tenant: tenant._id, // Use the tenant ID
            property: propertyId,
            date: tourDate,
            timeSlot: timeSlot,
            duration: 30, // Default duration
            tourType: 'in-person', // Default tour type
            notes: '' // Default empty notes
        });

        await tour.save();

        // Send notification email to landlord
        await sendTourNotification(tour, 'request');

        return res.status(201).json({
            status: true,
            data: tour,
            message: 'Tour request submitted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get tenant's tours
export const getMyTours = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, dateFrom, dateTo } = req.query;

        // Find tenant record using user ID
        const tenant = await Tenant.findOne({ user: userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tenant profile not found',
                error: 'Tenant not found'
            });
        }

        const query = { tenant: tenant._id };
        
        // Apply filters
        if (status) {
            query.status = status;
        }
        if (dateFrom) {
            query.date = { $gte: new Date(dateFrom) };
        }
        if (dateTo) {
            query.date = { ...query.date, $lte: new Date(dateTo) };
        }

        const tours = await Tour.find(query)
            .populate('property', 'propertyName address frontImage')
            .populate('landlord', 'firstName lastName email phoneNumber')
            .populate('tenant', 'firstName lastName email phoneNumber')
            .sort({ date: 1, timeSlot: 1 });

        return res.status(200).json({
            status: true,
            data: tours,
            message: 'Tours retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get tour by ID
export const getTourById = async (req, res) => {
    try {
        const { tourId } = req.params;
        const userId = req.user.userId;

        // Find tenant record using user ID
        const tenant = await Tenant.findOne({ user: userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tenant profile not found',
                error: 'Tenant not found'
            });
        }

        // First get the tour without population for authorization check
        const tourForAuth = await Tour.findById(tourId);
        if (!tourForAuth) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tour not found',
                error: 'Tour not found'
            });
        }

        // Check if tenant has permission to view this tour
        if (tourForAuth.tenant.toString() !== tenant._id.toString()) {
            return res.status(403).json({
                status: false,
                data: null,
                message: 'Unauthorized access - You can only access your own tours',
                error: 'Unauthorized'
            });
        }

        // Now get the populated tour for response
        const tour = await Tour.findById(tourId)
            .populate('property', 'propertyName address frontImage monthlyRent')
            .populate('landlord', 'firstName lastName email phoneNumber')
            .populate('tenant', 'firstName lastName email phoneNumber');

        return res.status(200).json({
            status: true,
            data: tour,
            message: 'Tour retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Cancel tour
export const cancelTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const userId = req.user.userId;

        // Find tenant record using user ID
        const tenant = await Tenant.findOne({ user: userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tenant profile not found',
                error: 'Tenant not found'
            });
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tour not found',
                error: 'Tour not found'
            });
        }

        // Check if tenant has permission to cancel this tour
        if (tour.tenant.toString() !== tenant._id.toString()) {
            return res.status(403).json({
                status: false,
                data: null,
                message: 'Unauthorized access - You can only cancel your own tours',
                error: 'Unauthorized'
            });
        }

        // Validate status transitions
        const validTransitions = {
            pending: ['cancelled'],
            confirmed: ['cancelled'],
            declined: [],
            cancelled: [],
            completed: []
        };

        if (!validTransitions[tour.status].includes('cancelled')) {
            return res.status(400).json({
                status: false,
                data: null,
                message: `Cannot cancel tour with status: ${tour.status}`,
                error: 'Invalid status transition'
            });
        }

        // Update tour
        tour.status = 'cancelled';
        await tour.save();

        // Send notification
        await sendTourNotification(tour, 'cancelled');

        return res.status(200).json({
            status: true,
            data: tour,
            message: 'Tour cancelled successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reschedule tour
export const rescheduleTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { date, timeSlot } = req.body;
        const userId = req.user.userId;

        // Find tenant record using user ID
        const tenant = await Tenant.findOne({ user: userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tenant profile not found',
                error: 'Tenant not found'
            });
        }

        // Validate required fields
        if (!date || !timeSlot) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Date and time slot are required',
                error: 'Missing required fields'
            });
        }

        // Validate date is in the future
        const tourDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (tourDate < today) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Tour date must be in the future',
                error: 'Invalid date'
            });
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tour not found',
                error: 'Tour not found'
            });
        }

        // Check if tenant has permission to reschedule this tour
        if (tour.tenant.toString() !== tenant._id.toString()) {
            return res.status(403).json({
                status: false,
                data: null,
                message: 'Unauthorized access - You can only reschedule your own tours',
                error: 'Unauthorized'
            });
        }

        // Calculate start and end times for the rescheduled tour
        const tourDuration = tour.duration || 30;
        const [startHour, startMinute] = timeSlot.split(':').map(Number);
        const startTime = new Date(tourDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + tourDuration);

        // Check for time conflicts with existing tours (excluding the current tour being rescheduled)
        const existingTours = await Tour.find({
            property: tour.property,
            date: tourDate,
            status: { $in: ['pending', 'confirmed'] },
            _id: { $ne: tourId }
        });

        // Check for time conflicts
        for (const existingTour of existingTours) {
            const [existingStartHour, existingStartMinute] = existingTour.timeSlot.split(':').map(Number);
            const existingStartTime = new Date(tourDate);
            existingStartTime.setHours(existingStartHour, existingStartMinute, 0, 0);
            
            const existingEndTime = new Date(existingStartTime);
            existingEndTime.setMinutes(existingEndTime.getMinutes() + (existingTour.duration || 30));

            // Check if there's a time overlap
            // Conflict occurs when:
            // - Requested start time is before existing end time AND
            // - Requested end time is after existing start time
            if (startTime < existingEndTime && endTime > existingStartTime) {
                return res.status(409).json({
                    status: false,
                    data: null,
                    message: `Time conflict detected. The rescheduled tour time (${timeSlot} for ${tourDuration} minutes) overlaps with an existing tour. Please choose a different time.`,
                    error: 'Time conflict',
                    conflictDetails: {
                        requestedTime: {
                            start: startTime.toLocaleTimeString(),
                            end: endTime.toLocaleTimeString(),
                            duration: tourDuration
                        },
                        conflictingTour: {
                            start: existingStartTime.toLocaleTimeString(),
                            end: existingEndTime.toLocaleTimeString(),
                            duration: existingTour.duration || 30
                        }
                    }
                });
            }
        }

        // Store original date if not already stored
        if (!tour.originalDate) {
            tour.originalDate = tour.date;
        }

        // Update tour
        tour.date = tourDate;
        tour.timeSlot = timeSlot;
        tour.rescheduled = true;
        tour.status = 'pending'; // Reset to pending for approval

        await tour.save();

        // Send notification
        await sendTourNotification(tour, 'rescheduled');

        return res.status(200).json({
            status: true,
            data: tour,
            message: 'Tour rescheduled successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get available time slots for a property
export const getAvailableTimeSlots = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { date, duration = 30 } = req.query;

        if (!date) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Date parameter is required',
                error: 'Missing date parameter'
            });
        }

        const allTimeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const tourDate = new Date(date);

        // Get booked tours for this property on this date
        const bookedTours = await Tour.find({
            property: propertyId,
            date: tourDate,
            status: { $in: ['pending', 'confirmed'] }
        });

        // Check each time slot for conflicts
        const availableTimeSlots = [];
        const bookedTimeSlots = [];

        for (const timeSlot of allTimeSlots) {
            // Calculate start and end times for this time slot
            const [startHour, startMinute] = timeSlot.split(':').map(Number);
            const startTime = new Date(tourDate);
            startTime.setHours(startHour, startMinute, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

            // Check if this time slot conflicts with any existing tours
            let hasConflict = false;
            for (const tour of bookedTours) {
                const [existingStartHour, existingStartMinute] = tour.timeSlot.split(':').map(Number);
                const existingStartTime = new Date(tourDate);
                existingStartTime.setHours(existingStartHour, existingStartMinute, 0, 0);
                
                const existingEndTime = new Date(existingStartTime);
                existingEndTime.setMinutes(existingEndTime.getMinutes() + (tour.duration || 30));

                // Check for overlap
                if (startTime < existingEndTime && endTime > existingStartTime) {
                    hasConflict = true;
                    break;
                }
            }

            if (hasConflict) {
                bookedTimeSlots.push(timeSlot);
            } else {
                availableTimeSlots.push(timeSlot);
            }
        }

        return res.status(200).json({
            status: true,
            data: {
                date: date,
                availableTimeSlots: availableTimeSlots,
                bookedTimeSlots: bookedTimeSlots,
                requestedDuration: parseInt(duration)
            },
            message: 'Available time slots retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to send tour notifications
const sendTourNotification = async (tour, action) => {
    try {
        const populatedTour = await Tour.findById(tour._id)
            .populate('property', 'propertyName address')
            .populate('tenant', 'firstName lastName email')
            .populate('landlord', 'firstName lastName email');

        const tourData = {
            propertyName: populatedTour.property.propertyName,
            date: populatedTour.date,
            timeSlot: populatedTour.timeSlot,
            tenantName: `${populatedTour.tenant.firstName} ${populatedTour.tenant.lastName}`,
            landlordName: `${populatedTour.landlord.firstName} ${populatedTour.landlord.lastName}`,
            notes: populatedTour.notes,
            tourId: tour._id
        };

        const emailTemplate = createTourNotificationEmail(action, tourData);
        if (!emailTemplate) return;

        // Send email to tenant
        if (['confirmed', 'declined', 'cancelled', 'rescheduled'].includes(action)) {
            await sendEmail({
                to: populatedTour.tenant.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
        }

        // Send email to landlord for new requests
        if (action === 'request') {
            await sendEmail({
                to: populatedTour.landlord.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
        }

        // Create in-app notifications
        try {
            // Create notification for tenant
            if (['confirmed', 'declined', 'cancelled', 'rescheduled'].includes(action)) {
                await createNotification({
                    recipientId: populatedTour.tenant._id,
                    userRole: 'tenant',
                    type: `tour_${action}`,
                    message: `Your tour for ${populatedTour.property.propertyName} has been ${action}.`,
                    link: `/tours/${tour._id}`
                });
            }

            // Create notification for landlord
            if (['request', 'cancelled', 'rescheduled'].includes(action)) {
                const landlordMessage = action === 'request' 
                    ? `New tour request from ${populatedTour.tenant.firstName} ${populatedTour.tenant.lastName} for ${populatedTour.property.propertyName}`
                    : `Tour ${action} by ${populatedTour.tenant.firstName} ${populatedTour.tenant.lastName} for ${populatedTour.property.propertyName}`;

                await createNotification({
                    recipientId: populatedTour.landlord._id,
                    userRole: 'landlord',
                    type: `tour_${action}`,
                    message: landlordMessage,
                    link: `/tours/${tour._id}`
                });

                // Send email notification if landlord has email notifications enabled
                if (['request', 'cancelled', 'rescheduled'].includes(action)) {
                    const landlordEmailTemplate = createLandlordTourEmail(action, tourData);
                    if (landlordEmailTemplate) {
                        await sendEmailNotification({
                            recipientId: populatedTour.landlord._id,
                            userRole: 'landlord',
                            notificationType: 'listingsInquiries',
                            subject: landlordEmailTemplate.subject,
                            htmlContent: landlordEmailTemplate.html
                        });
                    }
                }
            }
        } catch (notificationError) {
            console.error('Error creating tour notifications:', notificationError);
            // Don't fail the request if notification fails
        }

    } catch (error) {
        console.error('Error sending tour notification:', error);
    }
};

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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, read, unread]
 *           default: all
 *         description: Filter by read status
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
 */
export const getTenantNotifications = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }

        const { page, limit, filter } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            filter: filter || 'all'
        };

        const result = await getNotifications(tenant._id, 'tenant', options);

        res.json({
            status: true,
            data: result,
            message: "Notifications retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve notifications",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
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
 */
export const markNotificationAsReadById = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }

        const notification = await markNotificationAsRead(req.params.id, tenant._id, 'tenant');

        res.json({
            status: true,
            data: notification,
            message: "Notification marked as read successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to mark notification as read",
            error: err.message
        });
    }
};

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
 *                 message:
 *                   type: string
 */
export const markAllNotificationsAsReadForTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }

        const result = await markAllNotificationsAsRead(tenant._id, 'tenant');

        res.json({
            status: true,
            data: { modifiedCount: result.modifiedCount },
            message: "All notifications marked as read successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to mark notifications as read",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count for the current tenant
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
 *                 message:
 *                   type: string
 */
export const getUnreadNotificationCountForTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant not found",
                error: null
            });
        }

        const unreadCount = await getUnreadNotificationCount(tenant._id, 'tenant');

        res.json({
            status: true,
            data: { unreadCount },
            message: "Unread count retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to get unread count",
            error: err.message
        });
    }
};



/**
 * @swagger
 * /tenant/social-links/disconnect:
 *   post:
 *     summary: Disconnect a social account
 *     description: Disconnect a social media account from the tenant's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [google, microsoft, linkedin, instagram]
 *                 description: Social media platform to disconnect
 *     responses:
 *       200:
 *         description: Social account disconnected successfully
 *       400:
 *         description: Invalid platform
 *       404:
 *         description: Account not connected
 */
export const disconnectSocialAccount = async (req, res) => {
    try {
        const { platform } = req.body;
        
        // Validate platform
        const validPlatforms = ['google', 'microsoft', 'linkedin', 'instagram'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                status: false,
                message: `Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`,
                error: null
            });
        }

        // Check if account is connected
        const existingTenant = await Tenant.findOne({ 
            user: req.user.userId,
            [`socialLinks.${platform}.connected`]: true
        });

        if (!existingTenant) {
            return res.status(404).json({
                status: false,
                message: `${platform} account is not connected`,
                error: null
            });
        }

        // Disconnect the account (keep profile info but mark as disconnected)
        const tenant = await Tenant.findOneAndUpdate(
            { user: req.user.userId },
            { 
                $set: { 
                    [`socialLinks.${platform}.connected`]: false,
                    [`socialLinks.${platform}.accessToken`]: null,
                    [`socialLinks.${platform}.refreshToken`]: null
                } 
            },
            { new: true, runValidators: true }
        );

        res.json({
            status: true,
            data: tenant,
            message: `${platform} account disconnected successfully`,
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to disconnect social account",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenant/social-links/sync:
 *   post:
 *     summary: Sync social account profile
 *     description: Sync profile information from a connected social media account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [google, microsoft, linkedin, instagram]
 *                 description: Social media platform to sync
 *     responses:
 *       200:
 *         description: Profile synced successfully
 *       400:
 *         description: Invalid platform
 *       404:
 *         description: Account not connected
 */
export const syncSocialAccount = async (req, res) => {
    try {
        const { platform } = req.query;
        
        // Validate platform
        const validPlatforms = ['google', 'microsoft', 'linkedin', 'instagram'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                status: false,
                message: `Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`,
                error: null
            });
        }

        // Check if account is connected
        const tenant = await Tenant.findOne({ 
            user: req.user.userId,
            [`socialLinks.${platform}.connected`]: true
        });

        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: `${platform} account is not connected`,
                error: null
            });
        }

        // Get current social account data
        const currentSocialData = tenant.socialLinks[platform];
        
        if (!currentSocialData.accessToken) {
            return res.status(400).json({
                status: false,
                message: `${platform} account access token not found`,
                error: null
            });
        }

        try {
            // Fetch latest profile data from social platform
            const profileData = await socialMediaService.getUserProfile(platform, currentSocialData.accessToken);
            
            // Update tenant with new profile data
            const updatedTenant = await Tenant.findOneAndUpdate(
                { user: req.user.userId },
                { 
                    $set: { 
                        [`socialLinks.${platform}.lastSync`]: new Date(),
                        [`socialLinks.${platform}.profileInfo`]: profileData.profileInfo
                    } 
                },
                { new: true, runValidators: true }
            );

            res.json({
                status: true,
                data: updatedTenant,
                message: `${platform} profile synced successfully`,
                error: null
            });
        } catch (syncError) {
            res.status(500).json({
                status: false,
                message: "Failed to sync social account",
                error: syncError.message
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to sync social account",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenant/social-links/status:
 *   get:
 *     summary: Get social account connection status
 *     description: Get the connection status of all social media accounts for the current tenant
 *     responses:
 *       200:
 *         description: Social account status retrieved successfully
 */
export const getSocialAccountStatus = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user: req.user.userId });
        
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found",
                error: null
            });
        }

        // Extract only connection status and basic info for security
        const socialStatus = {};
        const platforms = ['google', 'microsoft', 'linkedin', 'instagram'];
        
        platforms.forEach(platform => {
            const socialData = tenant.socialLinks[platform];
            if (socialData) {
                socialStatus[platform] = {
                    connected: socialData.connected || false,
                    accountId: socialData.accountId || null,
                    lastSync: socialData.lastSync || null,
                    profileInfo: socialData.profileInfo || {}
                };
            } else {
                socialStatus[platform] = {
                    connected: false,
                    accountId: null,
                    lastSync: null,
                    profileInfo: {}
                };
            }
        });

        res.json({
            status: true,
            data: socialStatus,
            message: "Social account status retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to get social account status",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenant/social-links/auth-url:
 *   get:
 *     summary: Get OAuth authorization URL
 *     description: Generate OAuth authorization URL for connecting a social media account
 *     parameters:
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [google, microsoft, linkedin, instagram]
 *         description: Social media platform
 *     responses:
 *       200:
 *         description: Authorization URL generated successfully
 */
export const getAuthUrl = async (req, res) => {
    try {
        const { platform } = req.query;
        
        // Validate platform
        const validPlatforms = ['google', 'microsoft', 'linkedin', 'instagram'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({
                status: false,
                message: `Invalid platform: ${platform}. Valid platforms are: ${validPlatforms.join(', ')}`,
                error: null
            });
        }

        // Generate state parameter with tenant ID for security
        const tenantId = req.user.userId;
        const state = `${tenantId}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Get platform configuration
        const config = getPlatformConfig(platform);
        
        // Generate authorization URL
        const authUrl = socialMediaService.getAuthorizationUrl(
            platform,
            config.clientId,
            config.redirectUri,
            state
        );

        res.json({
            status: true,
            data: { authUrl, state },
            message: `${platform} authorization URL generated successfully`,
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to generate authorization URL",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /auth/{platform}/callback:
 *   get:
 *     summary: OAuth callback endpoint
 *     description: Handle OAuth callback from social media platforms
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [google, microsoft, linkedin, instagram]
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OAuth callback handled successfully
 */
export const handleOAuthCallback = async (req, res) => {
    try {

        
        const { platform } = req.params;
        const { code, state, error } = req.query;
        
        // Check for OAuth errors
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=${error}`);
        }
        
        // Validate platform
        const validPlatforms = ['google', 'microsoft', 'linkedin', 'instagram'];
        if (!validPlatforms.includes(platform)) {
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=invalid_platform`);
        }
        
        // Validate required parameters
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=missing_code`);
        }
        
        // Extract tenant ID from state parameter
        let tenantId = null;
        if (state) {
            // Handle potential JSON formatting in state parameter
            let cleanState = state;
            if (state.includes('"state"')) {
                // Extract state from JSON-like string
                const match = state.match(/"state"\s*:\s*"([^"]+)"/);
                if (match) {
                    cleanState = match[1];
                }
            }
            tenantId = cleanState.split('_')[0];
        }
        
        if (!tenantId) {
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=no_tenant_session`);
        }
        
        // Check if account is already connected
        const existingTenant = await Tenant.findOne({ 
            user: tenantId,
            [`socialLinks.${platform}.connected`]: true
        });

        if (existingTenant) {
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=already_connected`);
        }
        
        // Get platform configuration
        const config = getPlatformConfig(platform);
        
        console.log('OAuth Callback Debug:', {
            platform,
            code: code ? 'present' : 'missing',
            state,
            stateLength: state ? state.length : 0,
            config: {
                clientId: config.clientId ? 'present' : 'missing',
                clientSecret: config.clientSecret ? 'present' : 'missing',
                redirectUri: config.redirectUri
            }
        });
        
        // Exchange code for tokens
        let tokenResponse;
        try {
            tokenResponse = await socialMediaService.exchangeCodeForToken(
                platform,
                code,
                config.clientId,
                config.clientSecret,
                config.redirectUri
            );
            console.log('Token exchange successful:', { platform, hasAccessToken: !!tokenResponse.access_token });
        } catch (tokenError) {
            console.error('Token exchange failed:', tokenError);
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=token_exchange_failed&details=${encodeURIComponent(tokenError.message)}`);
        }
        
        // Get user profile
        let profileData;
        try {
            profileData = await socialMediaService.getUserProfile(
                platform,
                tokenResponse.access_token
            );
            console.log('Profile retrieval successful:', { platform, accountId: profileData.accountId });
        } catch (profileError) {
            console.error('Profile retrieval failed:', profileError);
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=profile_retrieval_failed&details=${encodeURIComponent(profileError.message)}`);
        }
        
        // Save the connection
        const socialData = {
            accountId: profileData.accountId,
            connected: true,
            lastSync: new Date(),
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token || null,
            profileInfo: profileData.profileInfo
        };
        
        const updatedTenant = await Tenant.findOneAndUpdate(
            { user: tenantId },
            { 
                $set: { 
                    [`socialLinks.${platform}`]: socialData 
                } 
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedTenant) {
            return res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=tenant_not_found`);
        }
        
        // Redirect to success page
        res.redirect(`${process.env.FRONTEND_URL}/social-accounts?success=true&platform=${platform}`);
        
    } catch (err) {
        console.error('OAuth callback error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/social-accounts?error=oauth_failed`);
    }
};

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
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const contactBuyerAgent = async (req, res) => {
    try {
        const { agentEmail, message, wantFinancingInfo } = req.body;
        const tenantId = req.user.userId;

        // Validate required fields
        if (!agentEmail || !message || wantFinancingInfo === undefined) {
            return res.status(400).json({
                status: false,
                message: 'Agent email, message, and financing info preference are required',
                error: 'Missing required fields'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(agentEmail)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid agent email format',
                error: 'Invalid email format'
            });
        }

        // Validate message length
        if (message.length > 1000) {
            return res.status(400).json({
                status: false,
                message: 'Message is too long (maximum 1000 characters)',
                error: 'Message too long'
            });
        }

        // Find tenant record using user ID
        const tenant = await Tenant.findOne({ user: tenantId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: 'Tenant profile not found',
                error: 'Tenant not found'
            });
        }

        // Get user details for email
        const user = await User.findById(tenantId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
                error: 'User not found'
            });
        }

        // Prepare email content
        const tenantEmail = user.email;
        const tenantName = `${tenant.firstName} ${tenant.lastName}`;
        const tenantPhone = tenant.phoneNumber || 'Not provided';

        // Create and send email to agent
        const agentEmailTemplate = createAgentInquiryEmail({
            tenantName,
            tenantEmail,
            tenantPhone,
            message,
            wantFinancingInfo
        });

        await sendEmail({
            to: agentEmail,
            subject: agentEmailTemplate.subject,
            html: agentEmailTemplate.html
        });

        // Create and send confirmation email to tenant
        const tenantEmailTemplate = createTenantConfirmationEmail({
            tenantName,
            tenantEmail,
            agentEmail,
            message
        });

        await sendEmail({
            to: tenantEmail,
            subject: tenantEmailTemplate.subject,
            html: tenantEmailTemplate.html
        });

        return res.status(200).json({
            status: true,
            message: 'Inquiry sent successfully. The agent will contact you soon.',
            data: {
                agentEmail,
                messageSent: true,
                confirmationSent: true
            }
        });

    } catch (error) {
        console.error('Contact agent error:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to send inquiry',
            error: error.message
        });
    }
};

// ==================== TENANT APPLICATION CONTROLLERS ====================

/**
 * Start a new tenant application for a property
 */
export const startApplication = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const tenantId = req.user.userId;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found",
                error: null
            });
        }

        // Check if tenant already has an application for this property
        const existingApplication = await TenantApplication.findOne({
            tenant: tenantId,
            property: propertyId
        });

        if (existingApplication) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "You already have an application for this property",
                error: null
            });
        }

        // Get tenant information
        const tenant = await Tenant.findOne({ user: tenantId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Tenant profile not found",
                error: null
            });
        }

        // Get user information
        const user = await User.findById(tenantId);
        if (!user) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "User not found",
                error: null
            });
        }

        // Create application with tenant's existing information
        const application = new TenantApplication({
            tenant: tenantId,
            property: propertyId,
            landlord: property.landlord,
            applicantInfo: {
                firstName: tenant.firstName,
                lastName: tenant.lastName,
                email: user.email,
                phoneNumber: tenant.phoneNumber,
                address: tenant.address,
                country: tenant.country,
                city: tenant.city,
                profilePicture: user.profilePicture,
                desiredMoveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
            },
            employerInfo: {
                employerName: tenant.employer || "Not specified",
                occupation: tenant.employmentStatus || "Not specified",
                monthlyIncome: tenant.monthlyIncome || 0,
                employmentDuration: "Not specified",
                employmentStatus: tenant.employmentStatus || "full_time"
            },
            backgroundCheck: {
                criminalRecords: false,
                evictionHistory: false,
                creditScore: 0,
                creditScoreRange: "fair"
            },
            // Remove rentalHistory field - we'll fetch it dynamically when querying
            submittedDocuments: {
                validId: "",
                utilityBill: "",
                bankStatement: ""
            }
        });

        await application.save();

        // Create notification for landlord
        await createNotification({
            recipientId: property.landlord,
            userRole: 'landlord',
            type: 'rental_application',
            message: `New application received for ${property.propertyName}`
        });

        // Send email notification to landlord
        const landlord = await Landlord.findById(property.landlord);
        if (landlord) {
            const landlordUser = await User.findById(landlord.user);
            if (landlordUser) {
                const emailTemplate = createNewApplicationEmail({
                    landlordName: `${landlord.firstName} ${landlord.lastName}`,
                    propertyName: property.propertyName,
                    tenantName: `${tenant.firstName} ${tenant.lastName}`,
                    tenantEmail: user.email,
                    tenantPhone: tenant.phoneNumber
                });

                await sendEmail({
                    to: landlordUser.email,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html
                });
            }
        }

        // Transform application to exclude sensitive fields
        const applicationObj = application.toObject();
        
        // Remove sensitive fields from the response
        delete applicationObj.employerInfo;
        delete applicationObj.backgroundCheck;
        delete applicationObj.submittedDocuments;

        res.status(201).json({
            status: true,
            data: applicationObj,
            message: "Application started successfully",
            error: null
        });

    } catch (error) {
        console.error('Start application error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to start application",
            error: error.message
        });
    }
};

/**
 * Get all applications for the current tenant
 */
export const getMyApplications = async (req, res) => {
    try {
        const tenantId = req.user.userId;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { tenant: tenantId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const applications = await TenantApplication.find(query)
            .populate('property') // Get all property fields
            .populate('landlord', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // For tenants, return simplified application data with only property details and application status
        const simplifiedApplications = applications.map(application => ({
            _id: application._id,
            status: application.status,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
            property: application.property,
            landlord: application.landlord
        }));

        const total = await TenantApplication.countDocuments(query);

        res.json({
            status: true,
            data: {
                applications: simplifiedApplications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            message: "Applications retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve applications",
            error: error.message
        });
    }
};

/**
 * Get a specific application by ID
 */
export const getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const tenantId = req.user.userId;

        const application = await TenantApplication.findOne({
            _id: applicationId,
            tenant: tenantId
        })
        .populate('property') // Get all property fields
        .populate('landlord', 'firstName lastName email phoneNumber')
        .populate('tenant', 'firstName lastName email phoneNumber');

        if (!application) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Application not found",
                error: null
            });
        }

        // For tenants, return simplified application data with only property details and application status
        const simplifiedApplication = {
            _id: application._id,
            status: application.status,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
            property: application.property,
            landlord: application.landlord
        };

        res.json({
            status: true,
            data: simplifiedApplication,
            message: "Application retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve application",
            error: error.message
        });
    }
};



/**
 * Cancel an application
 */
export const cancelApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const tenantId = req.user.userId;

        const application = await TenantApplication.findOne({
            _id: applicationId,
            tenant: tenantId
        }).populate('property', 'propertyName address monthlyRent propertyType bedrooms bathrooms frontImage description');

        if (!application) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Application not found",
                error: null
            });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Cannot cancel application that is no longer pending",
                error: null
            });
        }

        application.status = 'cancelled';
        await application.save();

        // Create notification for landlord
        await createNotification({
            recipientId: application.landlord,
            userRole: 'landlord',
            type: 'application_cancelled',
            message: `Application has been cancelled`
        });

        // Transform application to exclude sensitive fields
        const applicationObj = application.toObject();
        
        // Remove sensitive fields from the response
        delete applicationObj.employerInfo;
        delete applicationObj.backgroundCheck;
        delete applicationObj.submittedDocuments;

        res.json({
            status: true,
            data: applicationObj,
            message: "Application cancelled successfully",
            error: null
        });

    } catch (error) {
        console.error('Cancel application error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to cancel application",
            error: error.message
        });
    }
};

// ==================== RENTAL HISTORY CONTROLLERS ====================

/**
 * Create a new rental history record
 */
export const createRentalHistory = async (req, res) => {
    try {
        const tenantId = req.user.userId;
        
        // Use dynamic validation - exclude tenant field as it's set from auth context
        const { value, error } = validator.validateForCreate(req.body, RentalHistory, {
            excludeFields: ['tenant']
        });
        if (error) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Validation failed",
                error: error.details
            });
        }

        // Additional validation for rental dates
        if (value.rentalDates) {
            if (new Date(value.rentalDates.endDate) <= new Date(value.rentalDates.startDate)) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: "End date must be after start date",
                    error: null
                });
            }
        }

        // Create rental history record with validated data
        const rentalHistory = new RentalHistory({
            ...value,
            tenant: tenantId
        });

        await rentalHistory.save();

        res.status(201).json({
            status: true,
            data: rentalHistory,
            message: "Rental history record created successfully",
            error: null
        });

    } catch (error) {
        console.error('Create rental history error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to create rental history record",
            error: error.message
        });
    }
};

/**
 * Get all rental history records for the current tenant
 */
export const getAllRentalHistory = async (req, res) => {
    try {
        const tenantId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const rentalHistory = await RentalHistory.find({ tenant: tenantId })
            .sort({ 'rentalDates.startDate': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await RentalHistory.countDocuments({ tenant: tenantId });

        res.json({
            status: true,
            data: {
                rentalHistory,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            message: "Rental history retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get rental history error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve rental history",
            error: error.message
        });
    }
};

/**
 * Get a specific rental history record by ID
 */
export const getRentalHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.userId;

        const rentalHistory = await RentalHistory.findOne({
            _id: id,
            tenant: tenantId
        });

        if (!rentalHistory) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Rental history record not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: rentalHistory,
            message: "Rental history record retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get rental history by ID error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve rental history record",
            error: error.message
        });
    }
};

/**
 * Update a rental history record by ID
 */
export const updateRentalHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.userId;

        // Find the rental history record
        const rentalHistory = await RentalHistory.findOne({
            _id: id,
            tenant: tenantId
        });

        if (!rentalHistory) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Rental history record not found",
                error: null
            });
        }

        // Use dynamic validation - exclude tenant field as it's set from auth context
        const { value, error } = validator.validateForUpdate(req.body, RentalHistory, {
            excludeFields: ['tenant']
        });
        if (error) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Validation failed",
                error: error.details
            });
        }

        // Additional validation for rental dates if provided
        if (value.rentalDates) {
            if (new Date(value.rentalDates.endDate) <= new Date(value.rentalDates.startDate)) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: "End date must be after start date",
                    error: null
                });
            }
        }

        // Update fields with validated data
        Object.assign(rentalHistory, value);
        await rentalHistory.save();

        res.json({
            status: true,
            data: rentalHistory,
            message: "Rental history record updated successfully",
            error: null
        });

    } catch (error) {
        console.error('Update rental history error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update rental history record",
            error: error.message
        });
    }
};

/**
 * Delete a rental history record by ID
 */
export const deleteRentalHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = req.user.userId;

        const rentalHistory = await RentalHistory.findOne({
            _id: id,
            tenant: tenantId
        });

        if (!rentalHistory) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Rental history record not found",
                error: null
            });
        }

        await rentalHistory.deleteOne();

        res.json({
            status: true,
            data: null,
            message: "Rental history record deleted successfully",
            error: null
        });

    } catch (error) {
        console.error('Delete rental history error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to delete rental history record",
            error: error.message
        });
    }
};

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
 */
export const getAvailableRooms = async (req, res) => {
    try {
        const { propertyId } = req.params;
        
        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                status: false,
                message: "Property not found"
            });
        }

        // Get available rooms for the property
        const rooms = await Room.find({
            propertyId,
            status: 'available'
        }).sort({ floor: 1, roomNumber: 1 });

        res.json({
            status: true,
            data: {
                property: {
                    id: property._id,
                    name: property.propertyName,
                    address: property.address
                },
                rooms
            },
            message: "Available rooms retrieved successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to retrieve available rooms",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/leases/initiate:
 *   post:
 *     summary: Initiate lease with room selection and payment
 *     description: Proceed to payment and create lease. Requires an approved application for the property.
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
 *               - roomSelection
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: Property ID
 *               roomSelection:
 *                 type: object
 *                 properties:
 *                   floor:
 *                     type: string
 *                     description: Floor number
 *                   room:
 *                     type: string
 *                     description: Room number
 *     responses:
 *       201:
 *         description: Lease initiated and payment processed successfully
 *       403:
 *         description: Application not approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You must have an approved application for this property before proceeding to payment"
 */
export const proceedToPayment = async (req, res) => {
    try {
        const { propertyId, roomSelection } = req.body;
        
        // Get tenant
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found"
            });
        }

        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                status: false,
                message: "Property not found"
            });
        }

        // Check if tenant has an approved application for this property
        const application = await TenantApplication.findOne({
            tenant: req.user.userId,
            property: propertyId,
            status: 'approved'
        });

        if (!application) {
            return res.status(403).json({
                status: false,
                message: "You must have an approved application for this property before proceeding to payment"
            });
        }

        // Validate room exists and is available
        const roomIdentifier = `Floor ${roomSelection.floor}/Rm ${roomSelection.room}`;
        const room = await Room.findOne({
            propertyId,
            roomIdentifier,
            status: 'available'
        });

        if (!room) {
            return res.status(400).json({
                status: false,
                message: "Selected room is not available"
            });
        }

        // Process payment FIRST before creating lease
        const payment = await paymentService.processPayment({
            amount: room.rent,
            description: `Lease payment for ${property.propertyName} - ${roomIdentifier}`
        });

        // Only proceed with lease creation if payment is successful
        if (payment.status !== 'succeeded') {
            return res.status(400).json({
                status: false,
                message: "Payment failed. Please try again."
            });
        }

        // Create TenantPayment record for the lease payment
        const tenantPayment = new TenantPayment({
            tenant: tenant._id,
            description: `Lease payment for ${property.propertyName} - ${roomIdentifier}`,
            amount: room.rent,
            dueDate: new Date(), // Payment is due immediately
            transactionId: payment.id,
            status: 'paid',
            paymentMethod: 'fake_payment', // TODO: Replace with real payment method
            receipt: {
                receiptNumber: `RCPT-${Date.now()}`,
                datePaid: new Date(),
                paymentMethod: 'fake_payment',
                transactionId: payment.id,
                email: tenant.email,
                propertyName: property.propertyName,
                property: property._id,
                address: property.address,
                tenantId: tenant._id.toString(),
                leasePeriod: '12 months',
                monthlyRent: room.rent,
                maintenanceFee: 0,
                lateFee: 0,
                notes: 'Lease initiation payment'
            }
        });

        await tenantPayment.save();

        // Reserve the room temporarily while creating lease
        room.status = 'reserved';
        await room.save();

        // Calculate lease dates (start from next month, duration 12 months)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1);
        startDate.setDate(1); // Start from first day of next month
        
        const expirationDate = new Date(startDate);
        expirationDate.setMonth(expirationDate.getMonth() + 12);

        // Create lease with active status (since payment is completed)
        const lease = new Lease({
            tenantId: tenant._id,
            landlordId: property.landlord,
            propertyId,
            startDate,
            expirationDate,
            duration: '12 months',
            status: 'active', // Active because payment is completed
            currentProperty: property.propertyName,
            streetName: property.addressLine1,
            rent: room.rent,
            apartment: roomIdentifier,
            city: property.cityOrTown,
            zipCode: property.postalCode,
            roomSelection: {
                floor: roomSelection.floor,
                room: roomSelection.room,
                roomIdentifier
            },
            paymentStatus: 'completed',
            paymentDetails: {
                stripePaymentIntentId: payment.id,
                amount: room.rent,
                currency: 'usd',
                paidAt: new Date(),
                tenantPaymentId: tenantPayment._id // Reference to TenantPayment record
            }
        });

        await lease.save();

        // Update room status to occupied after lease is created
        room.status = 'occupied';
        room.currentLeaseId = lease._id;
        await room.save();

        res.status(201).json({
            status: true,
            data: {
                leaseId: lease._id,
                roomIdentifier,
                rent: room.rent,
                startDate,
                expirationDate,
                paymentId: payment.id
            },
            message: "Lease initiated and payment processed successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to initiate lease",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/leases/{leaseId}/payment:
 *   post:
 *     summary: Process payment for lease
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
// Payment is now handled in initiateLease function
export const processLeasePayment = async (req, res) => {
    res.status(400).json({
        status: false,
        message: "Payment is now handled during lease initiation"
    });
};

/**
 * @swagger
 * /tenants/leases/{leaseId}/payment/confirm:
 *   post:
 *     summary: Confirm payment and update lease status
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
// Payment confirmation is now handled in initiateLease function
export const confirmLeasePayment = async (req, res) => {
    res.status(400).json({
        status: false,
        message: "Payment confirmation is now handled during lease initiation"
    });
};

/**
 * @swagger
 * /tenants/leases/{leaseId}/documents:
 *   post:
 *     summary: Upload documents for lease
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
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
 *               passport:
 *                 type: string
 *                 format: binary
 *               driverLicense:
 *                 type: string
 *                 format: binary
 *               utilityBill:
 *                 type: string
 *                 format: binary
 *               bankLetter:
 *                 type: string
 *                 format: binary
 *               digitalSignature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 */
export const uploadLeaseDocuments = async (req, res) => {
    try {
        const { leaseId } = req.params;
        
        // Get tenant
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found"
            });
        }

        // Get lease
        const lease = await Lease.findOne({
            _id: leaseId,
            tenantId: tenant._id,
            status: 'active'
        });

        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found or not active"
            });
        }

        const documentFields = ['passport', 'driverLicense', 'utilityBill', 'bankLetter', 'digitalSignature'];
        const uploadedDocuments = {};


        
        // Process uploaded files
        for (const field of documentFields) {
            if (req.files && req.files[field]) {
                // Handle array of files (multer.fields returns arrays)
                const fileArray = Array.isArray(req.files[field]) ? req.files[field] : [req.files[field]];
                const file = fileArray[0]; // Take the first file
                

                
                // Check if file has required properties
                if (!file || !file.buffer) {
                    continue;
                }
                
                // Use originalname if available, otherwise generate one
                const fileName = file.originalname || `uploaded_${field}_${Date.now()}`;
                
                // Validate document
                if (!documentService.validateDocument(file)) {
                    return res.status(400).json({
                        status: false,
                        message: `Invalid ${field} document. Please check file type and size. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG. Max size: 5MB.`
                    });
                }

                // Upload file
                try {
                    const fileInfo = await uploads(file.buffer, fileName, 'personal');
                    uploadedDocuments[field] = fileInfo.path;
                } catch (error) {
                    return res.status(400).json({
                        status: false,
                        message: `Failed to upload ${field}: ${error.message}`
                    });
                }
            }
        }

        // Update lease with document paths
        lease.documents = { ...lease.documents, ...uploadedDocuments };
        await lease.save();

        res.json({
            status: true,
            data: {
                leaseId: lease._id,
                uploadedDocuments: Object.keys(uploadedDocuments)
            },
            message: "Documents uploaded successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to upload documents",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/leases/{leaseId}/generate:
 *   post:
 *     summary: Generate lease document from template
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lease document generated successfully
 */
export const generateLeaseDocument = async (req, res) => {
    try {
        const { leaseId } = req.params;
        
        // Get tenant
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found"
            });
        }

        // Get lease with populated data
        const lease = await Lease.findOne({
            _id: leaseId,
            tenantId: tenant._id
        }).populate('landlordId').populate('propertyId');

        if (!lease) {
            return res.status(404).json({
                status: false,
                message: "Lease not found"
            });
        }

        // Get landlord to check for lease template
        const landlord = await Landlord.findById(lease.landlordId);
        if (!landlord.leaseTemplate) {
            return res.status(400).json({
                status: false,
                message: "No lease template available from landlord"
            });
        }

        // Prepare lease data for template processing
        const leaseData = {
            landlord: lease.landlordId,
            tenant,
            property: lease.propertyId,
            roomSelection: lease.roomSelection,
            startDate: lease.startDate,
            expirationDate: lease.expirationDate,
            rent: lease.rent
        };

        // Process lease template
        const processedDocumentPath = await documentService.processLeaseTemplate(
            landlord.leaseTemplate,
            leaseData
        );

        // Update lease with generated document path
        lease.leaseDocument = processedDocumentPath;
        lease.originalLeaseTemplate = landlord.leaseTemplate;
        await lease.save();

        // Return download link for frontend
        const downloadUrl = `${process.env.BACKEND_BASE_URL}/api/tenants/leases/${leaseId}/download`;

        res.json({
            status: true,
            data: {
                leaseId: lease._id,
                documentPath: processedDocumentPath,
                downloadUrl: downloadUrl,
                fileName: path.basename(processedDocumentPath)
            },
            message: "Lease document generated successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to generate lease document",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/leases/{leaseId}/download:
 *   get:
 *     summary: Download generated lease document
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lease document downloaded successfully
 */
export const downloadLeaseDocument = async (req, res) => {
    try {
        const { leaseId } = req.params;
        
        // Get tenant
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found"
            });
        }

        // Get lease
        const lease = await Lease.findOne({
            _id: leaseId,
            tenantId: tenant._id
        });

        if (!lease || !lease.leaseDocument) {
            return res.status(404).json({
                status: false,
                message: "Lease document not found"
            });
        }

        // Send file
        res.download(lease.leaseDocument);
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to download lease document",
            error: err.message
        });
    }
};

/**
 * @swagger
 * /tenants/leases/{leaseId}/renew:
 *   post:
 *     summary: Renew an existing lease
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leaseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newStartDate
 *               - newDuration
 *             properties:
 *               newStartDate:
 *                 type: string
 *                 format: date-time
 *               newDuration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lease renewed successfully
 */
export const renewLease = async (req, res) => {
    try {
        const { leaseId } = req.params;
        const { newStartDate, newDuration } = req.body;
        
        // Get tenant
        const tenant = await Tenant.findOne({ user: req.user.userId });
        if (!tenant) {
            return res.status(404).json({
                status: false,
                message: "Tenant not found"
            });
        }

        // Get original lease
        const originalLease = await Lease.findOne({
            _id: leaseId,
            tenantId: tenant._id,
            status: 'active'
        });

        if (!originalLease) {
            return res.status(404).json({
                status: false,
                message: "Original lease not found or not active"
            });
        }

        // Validate and calculate new expiration date
        const start = new Date(newStartDate);
        
        // Check if start date is valid
        if (isNaN(start.getTime())) {
            return res.status(400).json({
                status: false,
                message: "Invalid start date format. Please provide a valid date."
            });
        }
        
        const expirationDate = new Date(start);
        const months = parseInt(newDuration);
        
        // Check if duration is valid
        if (isNaN(months) || months <= 0) {
            return res.status(400).json({
                status: false,
                message: "Invalid duration. Please provide a valid number of months."
            });
        }
        
        expirationDate.setMonth(expirationDate.getMonth() + months);
        
        // Check if expiration date is valid
        if (isNaN(expirationDate.getTime())) {
            return res.status(400).json({
                status: false,
                message: "Failed to calculate expiration date. Please check your input."
            });
        }

        // Create new lease as renewal
        const renewedLease = new Lease({
            tenantId: tenant._id,
            landlordId: originalLease.landlordId,
            propertyId: originalLease.propertyId,
            startDate: start,
            expirationDate,
            duration: newDuration,
            status: 'pending',
            currentProperty: originalLease.currentProperty,
            streetName: originalLease.streetName,
            rent: originalLease.rent,
            apartment: originalLease.apartment,
            city: originalLease.city,
            zipCode: originalLease.zipCode,
            roomSelection: originalLease.roomSelection,
            isRenewal: true,
            originalLeaseId: originalLease._id
        });

        await renewedLease.save();

        // Terminate original lease
        originalLease.status = 'expired';
        originalLease.isTerminated = true;
        originalLease.termination = {
            reason: 'Renewed',
            comment: 'Lease renewed by tenant',
            terminatedAt: new Date()
        };
        await originalLease.save();

        res.status(201).json({
            status: true,
            data: {
                originalLeaseId: originalLease._id,
                renewedLeaseId: renewedLease._id,
                newStartDate: start,
                newExpirationDate: expirationDate
            },
            message: "Lease renewed successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to renew lease",
            error: err.message
        });
    }
};



