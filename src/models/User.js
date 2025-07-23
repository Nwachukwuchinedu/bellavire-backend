import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - role
 *       properties:
 *         id:
 *           type: stringdd
 *           description: The auto-generated id of the user
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           description: User's email address
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         authProvider:
 *           type: string
 *           enum: [local, google]
 *           description: Authentication provider
 *         role:
 *           type: string
 *           enum: [admin, landlord, tenant]
 *           description: User role in the system
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user is verified
 *         isActive:
 *           type: boolean
 *           description: Whether the user is active
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         googleId:
 *           type: string
 *           description: Google OAuth ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User update timestamp
 *         entityType:
 *           type: string
 *           enum: [individual, organization]
 *           description: Type of entity (individual or organization)
 *         hasCreatedPersonalInformationOrOrganizationInformation:
 *           type: boolean
 *           description: Whether the user has created their profile or organization information
 *       example:
 *         id: 60d0fe4f5311236168a109ca
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phoneNumber: '+1234567890'
 *         password: 'password123'
 *         authProvider: local
 *         role: tenant
 *         isEmailVerified: true
 *         isActive: true
 *         lastLogin: 2023-01-01T12:00:00Z
 *         googleId: '1234567890abcdef'
 *         createdAt: 2023-01-01T10:00:00Z
 *         updatedAt: 2023-01-01T10:00:00Z
 */
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
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
        trim: true,
        match: /^[\+]?[1-9][\d]{0,15}$/
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === 'local';
        },
        minlength: 6
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['admin', 'landlord', 'tenant'],
        default: 'tenant',
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    googleId: {
        type: String,
        sparse: true
    },
    entityType: {
        type: String,
        enum: ['individual', 'organization'],
        default: 'individual',
        required: true
    },
    hasCreatedPersonalInformationOrOrganizationInformation: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ authProvider: 1 });

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.authProvider !== 'local') {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (this.authProvider !== 'local') {
        throw new Error('Password comparison not available for non-local authentication');
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

export default User;
