import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       required:
 *         - tenant
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the payment method
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId
 *         type:
 *           type: string
 *           enum: [stripe, paystack]
 *           description: Payment gateway type
 *         stripeCustomerId:
 *           type: string
 *           description: Stripe customer ID (required for Stripe payments)
 *         stripePaymentMethodId:
 *           type: string
 *           description: Stripe payment method ID (required for Stripe payments)
 *         paystackCustomerCode:
 *           type: string
 *           description: Paystack customer code (required for Paystack payments)
 *         paystackAuthorizationCode:
 *           type: string
 *           description: Paystack authorization code for recurring payments
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Whether this is the default payment method
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether this payment method is active
 *         lastUsed:
 *           type: string
 *           format: date-time
 *           description: Last time this payment method was used
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
    type: {
        type: String,
        enum: ['stripe', 'paystack'],
        required: true,
        default: 'stripe'
    },
    // Stripe-specific fields
    stripeCustomerId: {
        type: String,
        required: function () {
            return this.type === 'stripe';
        }
    },
    stripePaymentMethodId: {
        type: String,
        required: function () {
            return this.type === 'stripe';
        }
    },
    // Paystack-specific fields
    paystackCustomerCode: {
        type: String,
        required: function () {
            return this.type === 'paystack';
        }
    },
    paystackAuthorizationCode: {
        type: String,
        required: function () {
            return this.type === 'paystack';
        }
    },
    paystackCardType: {
        type: String,
        description: 'Type of card (visa, mastercard, etc.)'
    },
    paystackLastFour: {
        type: String,
        description: 'Last four digits of the card'
    },
    paystackExpMonth: {
        type: String,
        description: 'Card expiration month'
    },
    paystackExpYear: {
        type: String,
        description: 'Card expiration year'
    },
    paystackBank: {
        type: String,
        description: 'Bank name for bank transfers'
    },
    // Common fields
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient queries
paymentMethodSchema.index({ tenant: 1, type: 1 });
paymentMethodSchema.index({ tenant: 1, isDefault: 1 });
paymentMethodSchema.index({ tenant: 1, isActive: 1 });

// Pre-save middleware to ensure only one default payment method per tenant
paymentMethodSchema.pre('save', async function (next) {
    if (this.isDefault && this.isModified('isDefault')) {
        // Remove default flag from other payment methods for this tenant
        await this.constructor.updateMany(
            {
                tenant: this.tenant,
                _id: { $ne: this._id },
                isDefault: true
            },
            { isDefault: false }
        );
    }
    next();
});

// Virtual for masked card number (for Paystack)
paymentMethodSchema.virtual('maskedCardNumber').get(function () {
    if (this.type === 'paystack' && this.paystackLastFour) {
        return `**** **** **** ${this.paystackLastFour}`;
    }
    return null;
});

// Virtual for payment method display name
paymentMethodSchema.virtual('displayName').get(function () {
    if (this.type === 'stripe') {
        return 'Stripe Payment Method';
    } else if (this.type === 'paystack') {
        if (this.paystackCardType) {
            return `${this.paystackCardType.charAt(0).toUpperCase() + this.paystackCardType.slice(1)} ending in ${this.paystackLastFour}`;
        } else if (this.paystackBank) {
            return `${this.paystackBank} Bank Transfer`;
        }
        return 'Paystack Payment Method';
    }
    return 'Unknown Payment Method';
});

// Method to check if payment method is valid
paymentMethodSchema.methods.isValid = function () {
    if (!this.isActive) return false;

    if (this.type === 'stripe') {
        return !!(this.stripeCustomerId && this.stripePaymentMethodId);
    } else if (this.type === 'paystack') {
        return !!(this.paystackCustomerCode && this.paystackAuthorizationCode);
    }

    return false;
};

// Method to update last used timestamp
paymentMethodSchema.methods.markAsUsed = function () {
    this.lastUsed = new Date();
    return this.save();
};

// Static method to get default payment method for a tenant
paymentMethodSchema.statics.getDefaultForTenant = function (tenantId) {
    return this.findOne({
        tenant: tenantId,
        isDefault: true,
        isActive: true
    });
};

// Static method to get all active payment methods for a tenant
paymentMethodSchema.statics.getActiveForTenant = function (tenantId) {
    return this.find({
        tenant: tenantId,
        isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });
};

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;

