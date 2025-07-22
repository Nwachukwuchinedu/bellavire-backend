/**
 * @swagger
 * components:
 *   schemas:
 *     Individual:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the individual
 *         user:
 *           type: string
 *           description: Reference to the User
 *       example:
 *         id: 60d0fe4f5311236168a109cd
 *         user: 60d0fe4f5311236168a109ca
 */
import mongoose from 'mongoose';

const individualSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

const Individual = mongoose.model('Individual', individualSchema);
export default Individual;
