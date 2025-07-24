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

const agentSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true }
}, { timestamps: true });

const Agent = mongoose.model('Agent', agentSchema);
export default Agent;
