import dotenv from 'dotenv';

dotenv.config();

/**
 * Paystack Configuration
 * This file contains all Paystack-related configuration and helper functions
 */

// Paystack API Configuration
export const paystackConfig = {
    // API Keys
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,

    // API URLs
    baseUrl: process.env.NODE_ENV === 'production'
        ? 'https://api.paystack.co'
        : 'https://api.paystack.co', // Paystack uses same URL for test and live

    // Webhook Secret
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,

    // Currency
    currency: 'NGN', // Nigerian Naira

    // Default callback URL
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || `${process.env.BACKEND_BASE_URL}/api/tenants/payment-callback`,

    // Default channels for payment
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],

    // Transaction timeout (in minutes)
    transactionTimeout: 30,

    // Retry configuration
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
};

// Validate Paystack configuration
export const validatePaystackConfig = () => {
    const requiredFields = ['secretKey', 'publicKey'];
    const missingFields = requiredFields.filter(field => !paystackConfig[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required Paystack configuration: ${missingFields.join(', ')}`);
    }

    return true;
};

// Helper function to format amount (Paystack expects amount in kobo)
export const formatAmount = (amount) => {
    // Convert to kobo (multiply by 100)
    return Math.round(amount * 100);
};

// Helper function to format amount back to naira
export const formatAmountFromKobo = (amountInKobo) => {
    return amountInKobo / 100;
};

// Helper function to generate unique reference
export const generateReference = (prefix = 'PAY') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

// Helper function to validate email
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate phone number (Nigerian format)
export const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's a valid Nigerian phone number
    // Nigerian numbers start with 234 and are 13 digits long
    if (cleanPhone.startsWith('234') && cleanPhone.length === 13) {
        return cleanPhone;
    }

    // If it starts with 0, replace with 234
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
        return '234' + cleanPhone.substring(1);
    }

    // If it's 11 digits and doesn't start with 0, add 234
    if (cleanPhone.length === 11 && !cleanPhone.startsWith('0')) {
        return '234' + cleanPhone;
    }

    return null;
};

// Helper function to format customer metadata
export const formatCustomerMetadata = (customerData) => {
    return {
        custom_fields: [
            {
                display_name: "Customer ID",
                variable_name: "customer_id",
                value: customerData.customerId || customerData.id
            },
            {
                display_name: "Customer Type",
                variable_name: "customer_type",
                value: customerData.customerType || 'tenant'
            }
        ]
    };
};

// Helper function to format transaction metadata
export const formatTransactionMetadata = (transactionData) => {
    return {
        custom_fields: [
            {
                display_name: "Transaction Type",
                variable_name: "transaction_type",
                value: transactionData.type || 'rent_payment'
            },
            {
                display_name: "Property ID",
                variable_name: "property_id",
                value: transactionData.propertyId || ''
            },
            {
                display_name: "Lease ID",
                variable_name: "lease_id",
                value: transactionData.leaseId || ''
            },
            {
                display_name: "Tenant ID",
                variable_name: "tenant_id",
                value: transactionData.tenantId || ''
            }
        ]
    };
};

// Export default configuration
export default paystackConfig;
