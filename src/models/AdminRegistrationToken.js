import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminRegistrationToken:
 *       type: object
 *       required:
 *         - token
 *         - email
 *         - generatedBy
 *         - expiresAt
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the token
 *         token:
 *           type: string
 *           description: The one-time registration token
 *         email:
 *           type: string
 *           description: Email address for the admin to be registered
 *         generatedBy:
 *           type: string
 *           description: ID of the owner who generated this token
 *         isUsed:
 *           type: boolean
 *           description: Whether the token has been used
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Token expiration timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Token creation timestamp
 */
const adminRegistrationTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for automatic cleanup of expired tokens
adminRegistrationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if token is valid
adminRegistrationTokenSchema.methods.isValid = function () {
    return !this.isUsed && new Date() < this.expiresAt;
};

// Method to mark token as used
adminRegistrationTokenSchema.methods.markAsUsed = function () {
    this.isUsed = true;
    return this.save();
};

const AdminRegistrationToken = mongoose.model('AdminRegistrationToken', adminRegistrationTokenSchema);

export default AdminRegistrationToken;
