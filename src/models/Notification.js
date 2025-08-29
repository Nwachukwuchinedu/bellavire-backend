/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - recipient
 *         - userRole
 *         - message
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the notification
 *         recipient:
 *           type: string
 *           description: User ID of the recipient (Admin, Tenant, or Landlord)
 *         userRole:
 *           type: string
 *           enum: [admin, tenant, landlord, agent]
 *           description: Role of the user receiving the notification
 *         message:
 *           type: string
 *           description: Notification message
 *         type:
 *           type: string
 *           description: Notification type
 *         link:
 *           type: string
 *           description: Optional link to related content
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
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userRole",
    },
    userRole: {
      type: String,
      enum: ["admin", "tenant", "landlord", "agent"],
      required: true,
    },
    message: { type: String, required: true },
    type: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for efficient queries
notificationSchema.index({ userRole: 1, recipient: 1, read: 1 });
notificationSchema.index({ userRole: 1, recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
