import mongoose from 'mongoose';
import { PersonalDetailsSchema } from './PersonalDetails.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Landlord:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - country
 *         - city
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the landlord
 *         firstName:
 *           type: string
 *           description: Landlord's first name
 *         lastName:
 *           type: string
 *           description: Landlord's last name
 *         email:
 *           type: string
 *           description: Landlord's email address
 *         phoneNumber:
 *           type: string
 *           description: Landlord's phone number
 *         country:
 *           type: string
 *           description: Landlord's country of residence
 *         city:
 *           type: string
 *           description: Landlord's city of residence
 *         address:
 *           type: string
 *           description: Current residential address
 *         user:
 *           type: string
 *           description: Reference to the User model
 *         notificationSettings:
 *           type: object
 *           description: Notification preferences for different events
 *           properties:
 *             security:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             newLease:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *                 notify:
 *                   type: string
 *                   enum: [instantly, 2min, 5min, 10min, never]
 *             rentalApplication:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *                 notify:
 *                   type: string
 *                   enum: [instantly, 2min, 5min, 10min, never]
 *             onlinePaymentMade:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             onlinePaymentInitiate:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             onlinePaymentFailed:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             onlinePaymentSuccessful:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             taskAssigned:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             connectionUpdate:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             listingsInquiries:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             newMessages:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             screeningReportSend:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             screeningReportUpdate:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             screeningReportCancelled:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             screeningReportReady:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             invoicePosted:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             invoiceOverdue:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *                 notify:
 *                   type: string
 *                   enum: [instantly, 2min, 5min, 10min, never]
 *             invoiceDue:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             lease:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *                 notify:
 *                   type: string
 *                   enum: [60days_before, 30days_before, day_of_expiration, never]
 *             maintenanceNewRequest:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             maintenanceChange:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             maintenanceMessage:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             maintenanceResolve:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *             textMessage:
 *               type: object
 *               properties:
 *                 feed:
 *                   type: boolean
 *                 email:
 *                   type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Landlord creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Landlord update timestamp
 */
const landlordSchema = new mongoose.Schema({
    ...PersonalDetailsSchema.obj,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    country: {
        type: String,
        trim: true,
        maxlength: 100
    },
    city: {
        type: String,
        trim: true,
        maxlength: 100
    },
    address: {
        type: String,
        trim: true,
        maxlength: 500
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    governmentIssuedId: {
        type: String,
        trim: true
    },
    notificationSettings: {
        security: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
        newLease: {
            feed: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            notify: { type: String, enum: ['instantly', '2min', '5min', '10min', 'never'], default: 'instantly' }
        },
        rentalApplication: {
            feed: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            notify: { type: String, enum: ['instantly', '2min', '5min', '10min', 'never'], default: 'instantly' }
        },
        onlinePaymentMade: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        onlinePaymentInitiate: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
        onlinePaymentFailed: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        onlinePaymentSuccessful: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        taskAssigned: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        connectionUpdate: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
        listingsInquiries: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        newMessages: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        screeningReportSend: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        screeningReportUpdate: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        screeningReportCancelled: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        screeningReportReady: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        invoicePosted: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        invoiceOverdue: {
            feed: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            notify: { type: String, enum: ['instantly', '2min', '5min', '10min', 'never'], default: 'instantly' }
        },
        invoiceDue: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        lease: {
            feed: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            notify: { type: String, enum: ['60days_before', '30days_before', 'day_of_expiration', 'never'], default: '30days_before' }
        },
        maintenanceNewRequest: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        maintenanceChange: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        maintenanceMessage: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        maintenanceResolve: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
        textMessage: { feed: { type: Boolean, default: true }, email: { type: Boolean, default: false } }
    },
    leaseTemplate: { type: String, description: 'Path to the landlord\'s lease template document' },
    
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
    
    // Bank Account Settings
    bankSettings: {
        accounts: [{
            bankName: { type: String, required: true, trim: true },
            accountNumber: { type: String, required: true, trim: true },
            accountType: { type: String, enum: ['checking', 'savings', 'business'], default: 'checking' },
            isMain: { type: Boolean, default: false },
            currency: { type: String, enum: ['USD', 'GBP', 'EUR', 'NGN'], default: 'USD' },
            isVerified: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    
    // Payment Settings
    paymentSettings: {
        autoRentCollection: { type: Boolean, default: false },
        defaultRentDueDate: { type: Number, min: 1, max: 31, default: 1 }, // Day of month
        gracePeriod: { type: Number, min: 0, max: 30, default: 5 }, // Days
        lateFeeSettings: {
            enabled: { type: Boolean, default: false },
            oneTimeFee: {
                enabled: { type: Boolean, default: false },
                amount: { type: Number, min: 0 },
                type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }
            },
            dailyFee: {
                enabled: { type: Boolean, default: false },
                amount: { type: Number, min: 0 },
                type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }
            }
        },
        recurringInvoiceSettings: {
            postingDays: { type: Number, min: 1, max: 30, default: 5 } // Days before due date
        }
    },
    
    // Accounting & Tax Settings
    accountingSettings: {
        taxYear: { type: String, default: '2024-2025' },
        quickBooksSync: { type: Boolean, default: false },
        defaultExpenseCategories: [{
            name: { type: String, required: true },
            isActive: { type: Boolean, default: true }
        }]
    },
    
    // Rental Application Settings
    rentalApplicationSettings: {
        applicationFee: {
            enabled: { type: Boolean, default: false },
            amount: { type: Number, min: 0 },
            currency: { type: String, enum: ['USD', 'GBP', 'EUR', 'NGN'], default: 'USD' },
            refundable: { type: Boolean, default: false }
        },
        onlineApplication: { type: Boolean, default: true },
        requireBackgroundCheck: { type: Boolean, default: true },
        requireIncomeVerification: { type: Boolean, default: true },
        minimumCreditScore: { type: Number, min: 300, max: 850 },
        customQuestions: [{
            question: { type: String, required: true },
            type: { type: String, enum: ['text', 'yes_no', 'multiple_choice'], default: 'text' },
            options: [String], // For multiple choice questions
            required: { type: Boolean, default: false }
        }]
    },
    
    // Notification Preferences (Enhanced)
    notificationPreferences: {
        paymentReceived: { type: Boolean, default: true },
        failedPaymentAlerts: { type: Boolean, default: true },
        tenantDelayNotices: { type: Boolean, default: true },
        maintenanceUpdates: { type: Boolean, default: true },
        leaseExpirationReminders: { type: Boolean, default: true },
        applicationNotifications: { type: Boolean, default: true },
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
}, {
    timestamps: true
});

// Indexes for better query performance
landlordSchema.index({ country: 1, city: 1 });

const Landlord = mongoose.model('Landlord', landlordSchema);

export default Landlord;
