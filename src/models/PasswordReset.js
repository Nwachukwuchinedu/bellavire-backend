/**
 * @swagger
 * components:
 *   schemas:
 *     PasswordReset:
 *       type: object
 *       required:
 *         - user
 *         - token
 *         - expires
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the password reset record
 *         user:
 *           type: string
 *           description: User ID (reference)
 *         token:
 *           type: string
 *           description: Password reset token
 *         expires:
 *           type: string
 *           format: date-time
 *           description: Expiration timestamp for the token
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 60d0fe4f5311236168a109cf
 *         user: 60d0fe4f5311236168a109ca
 *         token: "abcdef123456"
 *         expires: "2024-07-01T12:00:00Z"
 */
import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    expires: { type: Date, required: true }
}, { timestamps: true });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
export default PasswordReset;
