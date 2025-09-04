/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - company
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the agent
 *         firstName:
 *           type: string
 *           description: Agent's first name
 *         lastName:
 *           type: string
 *           description: Agent's last name
 *         email:
 *           type: string
 *           description: Agent's email address
 *         phoneNumber:
 *           type: string
 *           description: Agent's phone number
 *         company:
 *           type: string
 *           description: Agent's company
 *         user:
 *           type: string
 *           description: Reference to the User model
 *         accountSettings:
 *           type: object
 *           properties:
 *             displayAsCompany:
 *               type: boolean
 *             displayName:
 *               type: string
 *             preferredCurrency:
 *               type: string
 *               enum: [USD, GBP, EUR, NGN]
 *             twoFactorAuthentication:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 method:
 *                   type: string
 *                   enum: [sms, email, app]
 *         notificationSettings:
 *           type: object
 *           description: Comprehensive notification preferences for agents
 *         securitySettings:
 *           type: object
 *           properties:
 *             passwordLastChanged:
 *               type: string
 *               format: date-time
 *             loginNotifications:
 *               type: boolean
 *             deviceTracking:
 *               type: boolean
 *             sessionTimeout:
 *               type: integer
 *             ipWhitelist:
 *               type: array
 *               items:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Agent creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Agent update timestamp
 */
import mongoose from 'mongoose';
import { PersonalDetailsSchema } from './PersonalDetails.js';

const agentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    ...PersonalDetailsSchema.obj,
    company: { type: String, trim: true },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    governmentIssuedId: {
        type: String,
        trim: true
    },
    
    // Agent-specific notification settings
    notificationSettings: {
        security: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
        newLeads: {
            feed: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            notify: { type: String, enum: ['instantly', '10sec', 'never'], default: 'instantly' }
        },
        maintenanceTask: {
            feed: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            notify: { type: String, enum: ['instantly', '10sec', 'never'], default: 'instantly' }
        },
        taskAssigned: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        communication: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        onlinePayments: {
            paymentInitiated: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
            paymentCleared: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            paymentFailed: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } }
        },
        connectionUpdates: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
        listingInquiries: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        screeningReports: {
            reportSent: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            reportCanceled: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            reportReady: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } }
        },
        invoices: {
            invoicePosted: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            invoiceDue: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            invoiceOverdue: {
                feed: { type: Boolean, default: true },
                email: { type: Boolean, default: true },
                notify: { type: String, enum: ['instantly', '10sec', 'never'], default: 'instantly' }
            }
        },
        lease: {
            leaseExpired: {
                feed: { type: Boolean, default: true },
                email: { type: Boolean, default: true },
                notify: { type: String, enum: ['60days_before', '30days_before', 'day_of_expiration', 'never'], default: '30days_before' }
            },
            insuranceProvided: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            insuranceExpired: {
                feed: { type: Boolean, default: true },
                email: { type: Boolean, default: true },
                notify: { type: String, enum: ['60days_before', '30days_before', 'day_of_expiration', 'never'], default: '30days_before' }
            },
            leaseSigned: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } }
        },
        maintenanceRequests: {
            newRequest: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            statusChanges: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            requestMessage: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
            requestResolved: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } }
        },
        rentalApplication: {
            newApplication: {
                feed: { type: Boolean, default: true },
                email: { type: Boolean, default: true },
                notify: { type: String, enum: ['instantly', '10sec', 'never'], default: 'instantly' }
            }
        },
        textMessage: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } }
    },
    
    // Account Settings
    accountSettings: {
        displayAsCompany: { type: Boolean, default: false },
        displayName: { type: String, trim: true, maxlength: 100 },
        preferredCurrency: { type: String, enum: ['USD', 'GBP', 'EUR', 'NGN'], default: 'USD' },
        twoFactorAuthentication: {
            enabled: { type: Boolean, default: false },
            method: { type: String, enum: ['sms', 'email', 'app'], default: 'email' }
        }
    },
    
    // Notification Preferences (Enhanced)
    notificationPreferences: {
        newLeads: { type: Boolean, default: true },
        maintenanceUpdates: { type: Boolean, default: true },
        taskAssignments: { type: Boolean, default: true },
        paymentNotifications: { type: Boolean, default: true },
        communicationAlerts: { type: Boolean, default: true },
        emailDigest: {
            enabled: { type: Boolean, default: true },
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' }
        }
    },
    
    // Security Settings
    securitySettings: {
        passwordLastChanged: { type: Date },
        loginNotifications: { type: Boolean, default: true },
        deviceTracking: { type: Boolean, default: true },
        sessionTimeout: { type: Number, default: 30 }, // Minutes
        ipWhitelist: [String]
    }
}, { timestamps: true });

// Indexes for better query performance
agentSchema.index({ company: 1 });
// Note: user field already has unique: true, so no need for additional index

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;