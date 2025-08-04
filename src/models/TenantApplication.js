import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     TenantApplication:
 *       type: object
 *       required:
 *         - tenant
 *         - property
 *         - landlord
 *         - status
 *         - applicantInfo
 *         - employerInfo
 *         - backgroundCheck
 *         - submittedDocuments
 *       properties:
 *         tenant:
 *           type: string
 *           description: Reference to the tenant (User ID)
 *         property:
 *           type: string
 *           description: Reference to the property
 *         landlord:
 *           type: string
 *           description: Reference to the landlord
 *         status:
 *           type: string
 *           enum: [pending, approved, cancelled]
 *           default: pending
 *           description: Application status
 *         applicantInfo:
 *           type: object
 *           required:
 *             - firstName
 *             - lastName
 *             - email
 *             - phoneNumber
 *             - address
 *             - desiredMoveInDate
 *           properties:
 *             firstName:
 *               type: string
 *               description: Applicant's first name
 *             lastName:
 *               type: string
 *               description: Applicant's last name
 *             email:
 *               type: string
 *               format: email
 *               description: Applicant's email address
 *             phoneNumber:
 *               type: string
 *               description: Applicant's phone number
 *             address:
 *               type: string
 *               description: Applicant's current address
 *             country:
 *               type: string
 *               description: Applicant's country
 *             city:
 *               type: string
 *               description: Applicant's city
 *             profilePicture:
 *               type: string
 *               description: URL to applicant's profile picture
 *             desiredMoveInDate:
 *               type: string
 *               format: date
 *               description: Desired move-in date
 *         employerInfo:
 *           type: object
 *           required:
 *             - employerName
 *             - occupation
 *             - monthlyIncome
 *             - employmentDuration
 *           properties:
 *             employerName:
 *               type: string
 *               description: Name of the employer
 *             occupation:
 *               type: string
 *               description: Job title or occupation
 *             monthlyIncome:
 *               type: number
 *               description: Monthly income amount
 *             employmentDuration:
 *               type: string
 *               description: How long they've been employed
 *             employmentStatus:
 *               type: string
 *               enum: [full_time, part_time, self_employed, student, employed, unemployed]
 *               description: Employment status
 *         backgroundCheck:
 *           type: object
 *           properties:
 *             criminalRecords:
 *               type: boolean
 *               description: Whether applicant has criminal records
 *             evictionHistory:
 *               type: boolean
 *               description: Whether applicant has eviction history
 *             creditScore:
 *               type: number
 *               description: Applicant's credit score
 *             creditScoreRange:
 *               type: string
 *               enum: [excellent, good, fair, poor]
 *               description: Credit score range

 *         submittedDocuments:
 *           type: object
 *           properties:
 *             validId:
 *               type: string
 *               description: URL to valid identification document
 *             utilityBill:
 *               type: string
 *               description: URL to utility bill document
 *             bankStatement:
 *               type: string
 *               description: URL to bank statement document
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Application creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Application update timestamp
 *       example:
 *         tenant: "507f1f77bcf86cd799439011"
 *         property: "507f1f77bcf86cd799439012"
 *         landlord: "507f1f77bcf86cd799439013"
 *         status: "pending"
 *         applicantInfo:
 *           firstName: "John"
 *           lastName: "Doe"
 *           email: "john.doe@example.com"
 *           phoneNumber: "+1234567890"
 *           address: "123 Main St, New York, NY 10001"
 *           country: "United States"
 *           city: "New York"
 *           profilePicture: "https://example.com/profile.jpg"
 *           desiredMoveInDate: "2024-02-01"
 *         employerInfo:
 *           employerName: "Tech Corp"
 *           occupation: "Software Engineer"
 *           monthlyIncome: 5000
 *           employmentDuration: "2 years"
 *           employmentStatus: "full_time"
 *         backgroundCheck:
 *           criminalRecords: false
 *           evictionHistory: false
 *           creditScore: 750
 *           creditScoreRange: "excellent"

 *         submittedDocuments:
 *           validId: "https://example.com/id-card.pdf"
 *           utilityBill: "https://example.com/utility-bill.pdf"
 *           bankStatement: "https://example.com/bank-statement.pdf"
 */
const tenantApplicationSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    landlord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'cancelled'],
        default: 'pending'
    },
    applicantInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
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
        profilePicture: {
            type: String,
            trim: true
        },
        desiredMoveInDate: {
            type: Date,
            required: true
        }
    },
    employerInfo: {
        employerName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        occupation: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        monthlyIncome: {
            type: Number,
            required: true,
            min: 0
        },
        employmentDuration: {
            type: String,
            required: true,
            trim: true
        },
        employmentStatus: {
            type: String,
            enum: ['full_time', 'part_time', 'self_employed', 'student', 'employed', 'unemployed'],
            default: 'full_time'
        }
    },

    backgroundCheck: {
        criminalRecords: {
            type: Boolean,
            default: false
        },
        evictionHistory: {
            type: Boolean,
            default: false
        },
        creditScore: {
            type: Number,
            min: 0,
            max: 850
        },
        creditScoreRange: {
            type: String,
            enum: ['excellent', 'good', 'fair', 'poor']
        }
    },

    submittedDocuments: {
        validId: {
            type: String,
            trim: true
        },
        utilityBill: {
            type: String,
            trim: true
        },
        bankStatement: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true
});

// Index for efficient queries
tenantApplicationSchema.index({ tenant: 1, property: 1 }, { unique: true });
tenantApplicationSchema.index({ landlord: 1, status: 1 });
tenantApplicationSchema.index({ status: 1, createdAt: -1 });

const TenantApplication = mongoose.model('TenantApplication', tenantApplicationSchema);

export default TenantApplication; 