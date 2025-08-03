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
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                   description: Google account ID or email
 *                 connected:
 *                   type: boolean
 *                   description: Whether the account is connected
 *                 profileInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Full name from Google profile
 *                     email:
 *                       type: string
 *                       description: Email from Google profile
 *                     picture:
 *                       type: string
 *                       description: Profile picture URL
 *                 lastSync:
 *                   type: string
 *                   format: date-time
 *                   description: Last time profile was synced
 *                 accessToken:
 *                   type: string
 *                   description: OAuth access token (encrypted)
 *                 refreshToken:
 *                   type: string
 *                   description: OAuth refresh token (encrypted)
 *             microsoft:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                   description: Microsoft account ID or email
 *                 connected:
 *                   type: boolean
 *                   description: Whether the account is connected
 *                 profileInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Full name from Microsoft profile
 *                     email:
 *                       type: string
 *                       description: Email from Microsoft profile
 *                     picture:
 *                       type: string
 *                       description: Profile picture URL
 *                 lastSync:
 *                   type: string
 *                   format: date-time
 *                   description: Last time profile was synced
 *                 accessToken:
 *                   type: string
 *                   description: OAuth access token (encrypted)
 *                 refreshToken:
 *                   type: string
 *                   description: OAuth refresh token (encrypted)
 *             linkedin:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                   description: LinkedIn account ID or username
 *                 connected:
 *                   type: boolean
 *                   description: Whether the account is connected
 *                 profileInfo:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Full name from LinkedIn profile
 *                     headline:
 *                       type: string
 *                       description: Professional headline
 *                     picture:
 *                       type: string
 *                       description: Profile picture URL
 *                     company:
 *                       type: string
 *                       description: Current company
 *                 lastSync:
 *                   type: string
 *                   format: date-time
 *                   description: Last time profile was synced
 *                 accessToken:
 *                   type: string
 *                   description: OAuth access token (encrypted)
 *                 refreshToken:
 *                   type: string
 *                   description: OAuth refresh token (encrypted)
 *             instagram:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                   description: Instagram account ID or username
 *                 connected:
 *                   type: boolean
 *                   description: Whether the account is connected
 *                 profileInfo:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       description: Instagram username
 *                     fullName:
 *                       type: string
 *                       description: Full name from Instagram profile
 *                     picture:
 *                       type: string
 *                       description: Profile picture URL
 *                     bio:
 *                       type: string
 *                       description: Instagram bio
 *                 lastSync:
 *                   type: string
 *                   format: date-time
 *                   description: Last time profile was synced
 *                 accessToken:
 *                   type: string
 *                   description: OAuth access token (encrypted)
 *                 refreshToken:
 *                   type: string
 *                   description: OAuth refresh token (encrypted)
 *         notifications:
 *           type: object
 *           properties:
 *             rentDueReminder:
 *               type: object
 *               properties:
 *                 sms:
 *                   type: boolean
 *                   description: Receive rent due reminders via SMS
 *                 email:
 *                   type: boolean
 *                   description: Receive rent due reminders via email
 *               description: Rent due reminder notification preferences
 *             maintenanceUpdates:
 *               type: object
 *               properties:
 *                 sms:
 *                   type: boolean
 *                   description: Receive maintenance updates via SMS
 *                 email:
 *                   type: boolean
 *                   description: Receive maintenance updates via email
 *               description: Maintenance updates notification preferences
 *             leaseRenewalNotices:
 *               type: object
 *               properties:
 *                 sms:
 *                   type: boolean
 *                   description: Receive lease renewal notices via SMS
 *                 email:
 *                   type: boolean
 *                   description: Receive lease renewal notices via email
 *               description: Lease renewal notices notification preferences
 *             chatMessages:
 *               type: object
 *               properties:
 *                 sms:
 *                   type: boolean
 *                   description: Receive chat message notifications via SMS
 *                 email:
 *                   type: boolean
 *                   description: Receive chat message notifications via email
 *               description: Chat message notification preferences
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
 *           google:
 *             accountId: 'john.doe@gmail.com'
 *             connected: true
 *             profileInfo:
 *               name: 'John Doe'
 *               email: 'john.doe@gmail.com'
 *               picture: 'https://lh3.googleusercontent.com/a/ACg8ocJ...'
 *             lastSync: '2024-01-15T10:30:00Z'
 *           linkedin:
 *             accountId: 'johndoe123'
 *             connected: true
 *             profileInfo:
 *               name: 'John Doe'
 *               headline: 'Software Engineer at Tech Corp'
 *               picture: 'https://media.licdn.com/dms/image/...'
 *               company: 'Tech Corp'
 *             lastSync: '2024-01-14T15:45:00Z'
 *         notifications:
 *           rentDueReminder:
 *             sms: true
 *             email: false
 *           maintenanceUpdates:
 *             sms: false
 *             email: true
 *           leaseRenewalNotices:
 *             sms: true
 *             email: true
 *           chatMessages:
 *             sms: false
 *             email: true
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
            accountId: {
                type: String,
                trim: true,
                match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            connected: {
                type: Boolean,
                default: false
            },
            profileInfo: {
                name: {
                    type: String,
                    trim: true
                },
                email: {
                    type: String,
                    trim: true,
                    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                },
                picture: {
                    type: String,
                    trim: true,
                    match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
                }
            },
            lastSync: {
                type: Date,
                default: null
            },
            accessToken: {
                type: String,
                trim: true
            },
            refreshToken: {
                type: String,
                trim: true
            }
        },
        microsoft: {
            accountId: {
                type: String,
                trim: true,
                match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            connected: {
                type: Boolean,
                default: false
            },
            profileInfo: {
                name: {
                    type: String,
                    trim: true
                },
                email: {
                    type: String,
                    trim: true,
                    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                },
                picture: {
                    type: String,
                    trim: true,
                    match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
                }
            },
            lastSync: {
                type: Date,
                default: null
            },
            accessToken: {
                type: String,
                trim: true
            },
            refreshToken: {
                type: String,
                trim: true
            }
        },
        linkedin: {
            accountId: {
                type: String,
                trim: true
            },
            connected: {
                type: Boolean,
                default: false
            },
            profileInfo: {
                name: {
                    type: String,
                    trim: true
                },
                headline: {
                    type: String,
                    trim: true
                },
                picture: {
                    type: String,
                    trim: true,
                    match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
                },
                company: {
                    type: String,
                    trim: true
                }
            },
            lastSync: {
                type: Date,
                default: null
            },
            accessToken: {
                type: String,
                trim: true
            },
            refreshToken: {
                type: String,
                trim: true
            }
        },
        instagram: {
            accountId: {
                type: String,
                trim: true
            },
            connected: {
                type: Boolean,
                default: false
            },
            profileInfo: {
                username: {
                    type: String,
                    trim: true
                },
                fullName: {
                    type: String,
                    trim: true
                },
                picture: {
                    type: String,
                    trim: true,
                    match: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:?#@!$&'()*+,;=]*)*$/
                },
                bio: {
                    type: String,
                    trim: true
                }
            },
            lastSync: {
                type: Date,
                default: null
            },
            accessToken: {
                type: String,
                trim: true
            },
            refreshToken: {
                type: String,
                trim: true
            }
        }
    },
    notifications: {
        rentDueReminder: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
        },
        maintenanceUpdates: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
        },
        leaseRenewalNotices: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
        },
        chatMessages: {
            sms: {
                type: Boolean,
                default: false
            },
            email: {
                type: Boolean,
                default: false
            }
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
