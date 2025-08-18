import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - transactionId
 *         - tenant
 *         - property
 *         - amount
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the payment
 *         transactionId:
 *           type: string
 *           description: Unique transaction identifier from payment gateway
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId reference
 *         property:
 *           type: string
 *           description: Property ObjectId reference
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Amount paid in currency units
 *         status:
 *           type: string
 *           enum: [pending, successful, failed]
 *           description: Payment status
 *         tenantName:
 *           type: string
 *           description: Name of the tenant (populated from Tenant model)
 *         propertyName:
 *           type: string
 *           description: Name of the property (populated from Property model)
 *         paymentMethod:
 *           type: string
 *           enum: [stripe, paystack]
 *           description: Payment gateway used
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Date and time of payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 60d0fe4f5311236168a109cf
 *         transactionId: "TXN_123456789"
 *         tenant: "60d0fe4f5311236168a109cb"
 *         property: "60d0fe4f5311236168a109cc"
 *         amount: 850.00
 *         status: "successful"
 *         tenantName: "John Doe"
 *         tenantProfilePicture: "https://example.com/profile.jpg"
 *         propertyName: "Sunset Apartments"
 *         paymentMethod: "paystack"
 *         paymentDate: "2024-01-15T10:30:00Z"
 *         createdAt: "2024-01-15T10:30:00Z"
 *         updatedAt: "2024-01-15T10:30:00Z"
 */
const paymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        required: true,
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        default: 'paystack'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});


const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

