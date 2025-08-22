import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PersonalDetailsSchema } from './PersonalDetails.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the admin
 *         firstName:
 *           type: string
 *           description: Admin's first name
 *         lastName:
 *           type: string
 *           description: Admin's last name
 *         email:
 *           type: string
 *           description: Admin's email address
 *         phoneNumber:
 *           type: string
 *           description: Admin's phone number
 *         password:
 *           type: string
 *           description: Admin's password (hashed)
 *         role:
 *           type: string
 *           enum: [owner, admin]
 *           description: Admin's role (owner or admin)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Admin creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Admin update timestamp
 */
const adminSchema = new mongoose.Schema({
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
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['owner', 'admin'],
        default: 'admin',
        required: true
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
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
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
