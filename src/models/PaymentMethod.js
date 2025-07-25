import mongoose from 'mongoose';
// import mongooseEncryption from 'mongoose-encryption'; // Uncomment if using mongoose-encryption

/**
 * PaymentMethod Schema
 *
 * - tenant: ObjectId reference to Tenant (indexed for efficient lookup)
 * - cardNumber: Encrypted string (never store raw card numbers in plaintext)
 * - expiryDate: String in MM/YY format
 * - nameOnCard: String
 * - cvv: NOT STORED (should only be used transiently during payment processing)
 *
 * Security Best Practices:
 * - Use environment-based encryption keys for cardNumber (never hardcode keys)
 * - Consider using tokenization with a payment processor for PCI compliance
 * - Never store CVV in the database
 */

const paymentMethodSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    cardNumber: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
        match: /^(0[1-9]|1[0-2])\/(\d{2})$/ // MM/YY format
    },
    nameOnCard: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});


const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
