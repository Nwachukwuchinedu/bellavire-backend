/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the organization
 *         user:
 *           type: string
 *           description: Reference to the User
 *       example:
 *         id: 60d0fe4f5311236168a109cb
 *         user: 60d0fe4f5311236168a109ca
 */
import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
