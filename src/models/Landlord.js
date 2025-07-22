import mongoose from 'mongoose';

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
        required: true,
        trim: true,
        maxlength: 100
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Indexes for better query performance
landlordSchema.index({ country: 1, city: 1 });

const Landlord = mongoose.model('Landlord', landlordSchema);

export default Landlord;
