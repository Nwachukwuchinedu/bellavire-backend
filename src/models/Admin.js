import mongoose from 'mongoose';

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
 *         - department
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
 *         department:
 *           type: string
 *           description: Admin's department
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Admin's permissions
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
    department: {
        type: String,
        trim: true,
        maxlength: 100
    },
    permissions: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
adminSchema.index({ department: 1 });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
