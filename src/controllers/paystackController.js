import paystackService from '../services/paystackService.js';
import Tenant from '../models/Tenant.js';
import TenantPayment from '../models/TenantPayment.js';

export const initializePayment = async (req, res) => {
    try {
        const { amount, email, reference, callbackUrl, metadata = {} } = req.body;

        if (!amount || !email) {
            return res.status(400).json({
                status: false,
                message: 'Amount and email are required'
            });
        }

        let tenant = null;
        if (req.user?.userId) {
            tenant = await Tenant.findOne({ user: req.user.userId });
        }

        const paymentResult = await paystackService.initializePayment({
            amount,
            email,
            reference,
            callbackUrl,
            metadata: { ...metadata, tenantId: tenant?._id?.toString() }
        });

        if (!paymentResult.success) {
            return res.status(400).json({
                status: false,
                message: paymentResult.error
            });
        }

        const paymentRecord = new TenantPayment({
            tenant: tenant?._id,
            description: metadata.description || 'Rent payment',
            amount,
            dueDate: new Date(),
            transactionId: paymentResult.data.reference,
            status: 'pending',
            paymentMethod: 'paystack',
            metadata: {
                paystackReference: paymentResult.data.reference,
                paystackAccessCode: paymentResult.data.accessCode
            }
        });

        await paymentRecord.save();

        res.json({
            status: true,
            data: {
                authorizationUrl: paymentResult.data.authorizationUrl,
                reference: paymentResult.data.reference,
                amount: paymentResult.data.amountInNaira,
                paymentId: paymentRecord._id
            },
            message: 'Payment initialized successfully'
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to initialize payment',
            error: error.message
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const verificationResult = await paystackService.verifyPayment(reference);

        if (!verificationResult.success) {
            return res.status(400).json({
                status: false,
                message: verificationResult.error
            });
        }

        const paymentRecord = await TenantPayment.findOne({
            'metadata.paystackReference': reference
        });

        if (!paymentRecord) {
            return res.status(404).json({
                status: false,
                message: 'Payment record not found'
            });
        }

        if (verificationResult.data.status === 'success') {
            paymentRecord.status = 'paid';
            paymentRecord.receipt = {
                receiptNumber: `RCPT-${Date.now()}`,
                datePaid: new Date(verificationResult.data.paid_at),
                paymentMethod: 'paystack',
                transactionId: verificationResult.data.reference
            };
        }

        await paymentRecord.save();

        res.json({
            status: true,
            data: {
                paymentId: paymentRecord._id,
                reference: verificationResult.data.reference,
                amount: verificationResult.data.amountInNaira,
                status: verificationResult.data.status
            },
            message: 'Payment verified successfully'
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];
        const body = JSON.stringify(req.body);

        if (!paystackService.verifyWebhookSignature(signature, body)) {
            return res.status(401).json({
                status: false,
                message: 'Invalid webhook signature'
            });
        }

        const webhookEvent = paystackService.processWebhookEvent(req.body);

        if (webhookEvent.type === 'payment_success') {
            const paymentRecord = await TenantPayment.findOne({
                'metadata.paystackReference': webhookEvent.data.reference
            });

            if (paymentRecord) {
                paymentRecord.status = 'paid';
                paymentRecord.receipt = {
                    receiptNumber: `RCPT-${Date.now()}`,
                    datePaid: new Date(webhookEvent.data.paidAt),
                    paymentMethod: 'paystack',
                    transactionId: webhookEvent.data.reference
                };
                await paymentRecord.save();
            }
        }

        res.json({
            status: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Webhook processing failed',
            error: error.message
        });
    }
}; 