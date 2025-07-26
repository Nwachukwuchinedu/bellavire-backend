import mongoose from 'mongoose';
import { PersonalDetailsSchema } from './PersonalDetails.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - country
 *         - city
 *         - gender
 *         - maritalStatus
 *         - employmentStatus
 *         - preferredLanguage
 *         - leaseSetting
 *         - socialLinks
 *         - notifications
 *       properties:
 *         firstName:
 *           type: string
 *           description: Tenant's first name
 *         lastName:
 *           type: string
 *           description: Tenant's last name
 *         email:
 *           type: string
 *           description: Tenant's email address
 *         phoneNumber:
 *           type: string
 *           description: Tenant's phone number
 *         country:
 *           type: string
 *           description: Tenant's country of residence
 *         city:
 *           type: string
 *           description: Tenant's city of residence
 *         religion:
 *           type: string
 *           description: Tenant's religion (optional)
 *         gender:
 *           type: string
 *           enum: [male, female, other, prefer_not_to_say]
 *           description: Tenant's gender
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed, separated]
 *           description: Tenant's marital status
 *         numberOfChildren:
 *           type: number
 *           minimum: 0
 *           description: Number of children
 *         employmentStatus:
 *           type: string
 *           enum: [full_time, part_time, self_employed, student]
 *           description: Tenant's employment status
 *         monthlyIncome:
 *           type: number
 *           minimum: 0
 *           description: Monthly income in currency units
 *         employer:
 *           type: string
 *           description: Name of employer (if employed)
 *         address:
 *           type: string
 *           description: Current residential address
 *         preferredLanguage:
 *           type: string
 *           enum: [english, french, german]
 *           description: Preferred language for communication
 *         leaseSetting:
 *           type: object
 *           required:
 *             - licenseReference
 *             - leaseStartDate
 *             - propertyName
 *             - leaseEndDate
 *             - accountType
 *             - city
 *             - currentProperty
 *           properties:
 *             licenseReference:
 *               type: string
 *               description: Reference to the license (ObjectId)
 *             leaseStartDate:
 *               type: string
 *               format: date-time
 *               description: Lease start date
 *             propertyName:
 *               type: string
 *               description: Name of the property
 *             leaseEndDate:
 *               type: string
 *               format: date-time
 *               description: Lease end date
 *             accountType:
 *               type: string
 *               description: Account type
 *             city:
 *               type: string
 *               description: City of the property
 *             currentProperty:
 *               type: string
 *               description: Current property name or ID
 *         socialLinks:
 *           type: object
 *           properties:
 *             google:
 *               type: string
 *               format: uri
 *               description: Google profile URL
 *             microsoft:
 *               type: string
 *               format: uri
 *               description: Microsoft profile URL
 *             linkedin:
 *               type: string
 *               format: uri
 *               description: LinkedIn profile URL
 *             instagram:
 *               type: string
 *               format: uri
 *               description: Instagram profile URL
 *         notifications:
 *           type: object
 *           properties:
 *             rentDueReminder:
 *               type: boolean
 *               description: Receive rent due reminders
 *             maintenanceUpdates:
 *               type: boolean
 *               description: Receive maintenance updates
 *             leaseRenewalNotices:
 *               type: boolean
 *               description: Receive lease renewal notices
 *             chatMessages:
 *               type: boolean
 *               description: Receive chat message notifications
 *         savedProperties:
 *           type: array
 *           items:
 *             type: string
 *             description: Property ObjectId
 *           description: List of property IDs the tenant has saved as favorites
 *         paymentHistory:
 *           type: object
 *           properties:
 *             totalPayment:
 *               type: number
 *             lastPayment:
 *               type: string
 *               format: date-time
 *             pendingPayment:
 *               type: number
 *           description: Payment history summary for the tenant
 *           example:
 *             totalPayment: 5000
 *             lastPayment: 2024-06-10T10:00:00Z
 *             pendingPayment: 1200
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tenant creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tenant update timestamp
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phoneNumber: '+1234567890'
 *         country: 'United States'
 *         city: 'New York'
 *         religion: 'Christianity'
 *         gender: 'male'
 *         maritalStatus: 'single'
 *         numberOfChildren: 0
 *         employmentStatus: 'self_employed'
 *         monthlyIncome: 5000
 *         employer: 'Tech Corp'
 *         address: '123 Main St, New York, NY 10001'
 *         preferredLanguage: 'english'
 *         leaseSetting:
 *           licenseReference: 60d0fe4f5311236168a109cb
 *           leaseStartDate: 2023-01-01T10:00:00Z
 *           propertyName: 'Sunset Apartments'
 *           leaseEndDate: 2024-01-01T10:00:00Z
 *           accountType: 'standard'
 *           city: 'New York'
 *           currentProperty: 'Sunset Apartments Unit 5A'
 *         socialLinks:
 *           google: 'https://plus.google.com/johndoe'
 *           microsoft: 'https://microsoft.com/johndoe'
 *           linkedin: 'https://linkedin.com/in/johndoe'
 *           instagram: 'https://instagram.com/johndoe'
 *         notifications:
 *           rentDueReminder: true
 *           maintenanceUpdates: false
 *           leaseRenewalNotices: true
 *           chatMessages: true
 */
const tenantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    ...PersonalDetailsSchema.obj,
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
    religion: {
        type: String,
        trim: true,
        maxlength: 100
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed', 'separated'],
    },
    numberOfChildren: {
        type: Number,
        min: 0,
        default: 0
    },
    employmentStatus: {
        type: String,
        enum: ['full_time', 'part_time', 'self_employed', 'student', 'employed'],
    },
    monthlyIncome: {
        type: Number,
        min: 0,
        default: 0
    },
    employer: {
        type: String,
        trim: true,
        maxlength: 200
    },
    address: {
        type: String,
        trim: true,
        maxlength: 500
    },
    preferredLanguage: {
        type: String,
        enum: ['english', 'french', 'german'],
        default: 'english'
    },
    leaseSetting: {
        licenseReference: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'License',
        },
        leaseStartDate: {
            type: Date,
        },
        propertyName: {
            type: String,
            trim: true
        },
        leaseEndDate: {
            type: Date,
        },
        accountType: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        currentProperty: {
            type: String,
            trim: true
        }
    ,
    default: {}
    },
    socialLinks: {
        google: {
            type: String,
            trim: true,
            match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
        },
        microsoft: {
            type: String,
            trim: true,
            match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
        },
        linkedin: {
            type: String,
            trim: true,
            match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
        },
        instagram: {
            type: String,
            trim: true,
            match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
        }
    ,
    default: {}
    },
    notifications: {
        rentDueReminder: {
            type: Boolean,
            default: false
        },
        maintenanceUpdates: {
            type: Boolean,
            default: false
        },
        leaseRenewalNotices: {
            type: Boolean,
            default: false
        },
        chatMessages: {
            type: Boolean,
            default: false
        }
    ,
    default: {}
    },
    savedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        default: []
    }],
    paymentHistory: {
        totalPayment: { type: Number, default: 0 },
        lastPayment: { type: Date },
        pendingPayment: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
tenantSchema.index({ country: 1, city: 1 });
tenantSchema.index({ employmentStatus: 1 });
tenantSchema.index({ preferredLanguage: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
