/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *         - company
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the agent
 *         firstName:
 *           type: string
 *           description: Agent's first name
 *         lastName:
 *           type: string
 *           description: Agent's last name
 *         email:
 *           type: string
 *           description: Agent's email address
 *         phoneNumber:
 *           type: string
 *           description: Agent's phone number
 *         company:
 *           type: string
 *           description: Agent's company
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Agent creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Agent update timestamp
 */
import mongoose from 'mongoose';
import { PersonalDetailsSchema } from './PersonalDetails.js';

const agentSchema = new mongoose.Schema({
    ...PersonalDetailsSchema.obj,
    company: { type: String, trim: true },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    governmentIssuedId: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
