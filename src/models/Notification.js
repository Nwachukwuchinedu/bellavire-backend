/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - admin
 *         - message
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the notification
 *         admin:
 *           type: string
 *           description: Admin user ID (reference)
 *         message:
 *           type: string
 *           description: Notification message
 *         type:
 *           type: string
 *           description: Notification type
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Notification creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Notification update timestamp
 */
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
