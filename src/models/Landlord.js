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
    address: {
        type: String,
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
