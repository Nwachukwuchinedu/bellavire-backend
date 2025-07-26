import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       required:
 *         - tenant
 *         - stripeCustomerId
 *         - stripePaymentMethodId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the payment method
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId
 *         stripeCustomerId:
 *           type: string
 *           description: Stripe customer ID
 *         stripePaymentMethodId:
 *           type: string
 *           description: Stripe payment method ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const paymentMethodSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    stripeCustomerId: {
        type: String,
        required: true,
    },
    stripePaymentMethodId: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;

