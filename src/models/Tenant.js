import mongoose from 'mongoose';

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
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the tenant
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Tenant creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Tenant update timestamp
 *       example:
 *         id: 60d0fe4f5311236168a109ca
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
 *         employmentStatus: 'employed'
 *         monthlyIncome: 5000
 *         employer: 'Tech Corp'
 *         address: '123 Main St, New York, NY 10001'
 *         preferredLanguage: 'english'
 *         createdAt: 2023-01-01T10:00:00Z
 *         updatedAt: 2023-01-01T10:00:00Z
 */
const tenantSchema = new mongoose.Schema({
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
        unique: true,
        lowercase: true,
        trim: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: /^[\+]?[1-9][\d]{0,15}$/
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
        enum: ['full_time', 'part_time', 'self_employed', 'student'],
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
