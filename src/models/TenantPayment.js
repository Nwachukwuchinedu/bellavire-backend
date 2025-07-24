import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     TenantPayment:
 *       type: object
 *       required:
 *         - tenant
 *         - amount
 *         - dueDate
 *         - transactionId
 *         - status
 *         - paymentMethod
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the payment
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId
 *         description:
 *           type: string
 *           description: Description of the payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Payment due date
 *         transactionId:
 *           type: string
 *           description: Transaction ID
 *         status:
 *           type: string
 *           enum: [paid, failed, outstanding]
 *           description: Payment status
 *         paymentMethod:
 *           type: string
 *           description: Payment method used
 *         receipt:
 *           type: object
 *           properties:
 *             receiptNumber:
 *               type: string
 *             datePaid:
 *               type: string
 *               format: date-time
 *             paymentMethod:
 *               type: string
 *             transactionId:
 *               type: string
 *             email:
 *               type: string
 *             propertyName:
 *               type: string
 *             property:
 *               type: string
 *               description: Property ObjectId
 *             address:
 *               type: string
 *             tenantId:
 *               type: string
 *             leasePeriod:
 *               type: string
 *             monthlyRent:
 *               type: number
 *             maintenanceFee:
 *               type: number
 *             lateFee:
 *               type: number
 *             notes:
 *               type: string
 *           description: Receipt details
 *         receiptDocument:
 *           type: string
 *           description: File path or URL to the receipt document
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const tenantPaymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  transactionId: { type: String, required: true },
  status: {
    type: String,
    enum: ['paid', 'failed', 'outstanding'],
    required: true,
    default: 'outstanding'
  },
  paymentMethod: { type: String, required: true },
  receipt: {
    receiptNumber: { type: String },
    datePaid: { type: Date },
    paymentMethod: { type: String },
    transactionId: { type: String },
    email: { type: String },
    propertyName: { type: String },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    address: { type: String },
    tenantId: { type: String },
    leasePeriod: { type: String },
    monthlyRent: { type: Number },
    maintenanceFee: { type: Number },
    lateFee: { type: Number },
    notes: { type: String }
  },
  receiptDocument: { type: String }
}, { timestamps: true });

const TenantPayment = mongoose.model('TenantPayment', tenantPaymentSchema);
export default TenantPayment; 