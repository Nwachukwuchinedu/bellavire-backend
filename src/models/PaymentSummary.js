import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentSummary:
 *       type: object
 *       required:
 *         - tenant
 *         - dueDate
 *         - amount
 *         - duration
 *         - status
 *         - action
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the payment summary
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId
 *         description:
 *           type: string
 *           description: Description of the payment summary
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *         duration:
 *           type: string
 *           description: Duration (e.g., 'monthly', 'annually')
 *         status:
 *           type: string
 *           enum: [cleared, outstanding]
 *           description: Payment status
 *         action:
 *           type: string
 *           enum: [paid, pending, unpaid, "paid now", missed, "over-due"]
 *           description: Payment action
 *         payment:
 *           type: string
 *           description: Reference to the TenantPayment ObjectId
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const paymentSummarySchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  duration: { type: String, required: true },
  status: {
    type: String,
    enum: ['cleared', 'outstanding'],
    required: true,
    default: 'outstanding'
  },
  action: {
    type: String,
    enum: ['paid', 'pending', 'unpaid', 'paid now', 'missed', 'over-due'],
    required: true,
    default: 'pending'
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'TenantPayment' }
}, { timestamps: true });

const PaymentSummary = mongoose.model('PaymentSummary', paymentSummarySchema);
export default PaymentSummary; 