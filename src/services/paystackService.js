import axios from 'axios';
import crypto from 'crypto';
import {
    paystackConfig,
    validatePaystackConfig,
    formatAmount,
    formatAmountFromKobo,
    generateReference,
    validateEmail,
    validatePhoneNumber,
    formatCustomerMetadata,
    formatTransactionMetadata
} from '../config/paystackConfig.js';

/**
 * Paystack Service
 * Handles all Paystack payment operations
 */
class PaystackService {
    constructor() {
        // Validate configuration on service initialization
        validatePaystackConfig();

        // Create axios instance with default config
        this.api = axios.create({
            baseURL: paystackConfig.baseUrl,
            headers: {
                'Authorization': `Bearer ${paystackConfig.secretKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        });
    }

    /**
     * Initialize a payment transaction
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} - Payment initialization response
     */
    async initializePayment(paymentData) {
        try {
            const {
                amount,
                email,
                reference,
                callbackUrl,
                metadata = {},
                channels = paystackConfig.channels,
                currency = paystackConfig.currency
            } = paymentData;

            // Validate required fields
            if (!amount || !email) {
                throw new Error('Amount and email are required');
            }

            if (!validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            // Generate reference if not provided
            const paymentReference = reference || generateReference('PAY');

            // Format amount to kobo
            const amountInKobo = formatAmount(amount);

            const requestData = {
                amount: amountInKobo,
                email,
                reference: paymentReference,
                callback_url: callbackUrl || paystackConfig.callbackUrl,
                channels,
                currency,
                metadata: {
                    ...metadata,
                    ...formatTransactionMetadata(metadata)
                }
            };

            const response = await this.api.post('/transaction/initialize', requestData);

            if (response.data.status) {
                return {
                    success: true,
                    data: {
                        authorizationUrl: response.data.data.authorization_url,
                        accessCode: response.data.data.access_code,
                        reference: response.data.data.reference,
                        amount: amountInKobo,
                        amountInNaira: amount
                    },
                    message: 'Payment initialized successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to initialize payment');
            }
        } catch (error) {
            console.error('Paystack payment initialization error:', error);
            return {
                success: false,
                error: error.message || 'Payment initialization failed'
            };
        }
    }

    /**
     * Verify a payment transaction
     * @param {string} reference - Transaction reference
     * @returns {Promise<Object>} - Payment verification response
     */
    async verifyPayment(reference) {
        try {
            if (!reference) {
                throw new Error('Transaction reference is required');
            }

            const response = await this.api.get(`/transaction/verify/${reference}`);

            if (response.data.status) {
                const transaction = response.data.data;

                return {
                    success: true,
                    data: {
                        id: transaction.id,
                        reference: transaction.reference,
                        amount: transaction.amount,
                        amountInNaira: formatAmountFromKobo(transaction.amount),
                        currency: transaction.currency,
                        status: transaction.status,
                        gateway_response: transaction.gateway_response,
                        channel: transaction.channel,
                        paid_at: transaction.paid_at,
                        created_at: transaction.created_at,
                        customer: transaction.customer,
                        metadata: transaction.metadata
                    },
                    message: 'Payment verified successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to verify payment');
            }
        } catch (error) {
            console.error('Paystack payment verification error:', error);
            return {
                success: false,
                error: error.message || 'Payment verification failed'
            };
        }
    }

    /**
     * Create or update a customer
     * @param {Object} customerData - Customer data
     * @returns {Promise<Object>} - Customer creation/update response
     */
    async createCustomer(customerData) {
        try {
            const {
                email,
                first_name,
                last_name,
                phone,
                metadata = {}
            } = customerData;

            // Validate required fields
            if (!email || !first_name || !last_name) {
                throw new Error('Email, first_name, and last_name are required');
            }

            if (!validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            // Format phone number if provided
            let formattedPhone = null;
            if (phone) {
                formattedPhone = validatePhoneNumber(phone);
                if (!formattedPhone) {
                    throw new Error('Invalid phone number format');
                }
            }

            const requestData = {
                email,
                first_name,
                last_name,
                phone: formattedPhone,
                metadata: {
                    ...metadata,
                    ...formatCustomerMetadata(customerData)
                }
            };

            const response = await this.api.post('/customer', requestData);

            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Customer created successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to create customer');
            }
        } catch (error) {
            console.error('Paystack customer creation error:', error);
            return {
                success: false,
                error: error.message || 'Customer creation failed'
            };
        }
    }

    /**
     * Get customer details
     * @param {string} customerId - Customer ID or email
     * @returns {Promise<Object>} - Customer details
     */
    async getCustomer(customerId) {
        try {
            if (!customerId) {
                throw new Error('Customer ID or email is required');
            }

            const response = await this.api.get(`/customer/${customerId}`);

            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Customer retrieved successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to get customer');
            }
        } catch (error) {
            console.error('Paystack get customer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get customer'
            };
        }
    }

    /**
     * Update customer details
     * @param {string} customerId - Customer ID
     * @param {Object} updateData - Customer update data
     * @returns {Promise<Object>} - Customer update response
     */
    async updateCustomer(customerId, updateData) {
        try {
            if (!customerId) {
                throw new Error('Customer ID is required');
            }

            const response = await this.api.put(`/customer/${customerId}`, updateData);

            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Customer updated successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to update customer');
            }
        } catch (error) {
            console.error('Paystack update customer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update customer'
            };
        }
    }

    /**
     * Charge a customer (recurring payment)
     * @param {Object} chargeData - Charge data
     * @returns {Promise<Object>} - Charge response
     */
    async chargeCustomer(chargeData) {
        try {
            const {
                amount,
                email,
                authorization_code,
                reference,
                metadata = {},
                currency = paystackConfig.currency
            } = chargeData;

            // Validate required fields
            if (!amount || !email || !authorization_code) {
                throw new Error('Amount, email, and authorization_code are required');
            }

            if (!validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            // Generate reference if not provided
            const chargeReference = reference || generateReference('CHG');

            // Format amount to kobo
            const amountInKobo = formatAmount(amount);

            const requestData = {
                amount: amountInKobo,
                email,
                authorization_code,
                reference: chargeReference,
                currency,
                metadata: {
                    ...metadata,
                    ...formatTransactionMetadata(metadata)
                }
            };

            const response = await this.api.post('/transaction/charge_authorization', requestData);

            if (response.data.status) {
                return {
                    success: true,
                    data: {
                        id: response.data.data.id,
                        reference: response.data.data.reference,
                        amount: response.data.data.amount,
                        amountInNaira: formatAmountFromKobo(response.data.data.amount),
                        status: response.data.data.status,
                        gateway_response: response.data.data.gateway_response,
                        channel: response.data.data.channel,
                        paid_at: response.data.data.paid_at,
                        created_at: response.data.data.created_at
                    },
                    message: 'Customer charged successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to charge customer');
            }
        } catch (error) {
            console.error('Paystack charge customer error:', error);
            return {
                success: false,
                error: error.message || 'Failed to charge customer'
            };
        }
    }

    /**
     * Get transaction details
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>} - Transaction details
     */
    async getTransaction(transactionId) {
        try {
            if (!transactionId) {
                throw new Error('Transaction ID is required');
            }

            const response = await this.api.get(`/transaction/${transactionId}`);

            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Transaction retrieved successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to get transaction');
            }
        } catch (error) {
            console.error('Paystack get transaction error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get transaction'
            };
        }
    }

    /**
     * List transactions
     * @param {Object} options - Query options
     * @returns {Promise<Object>} - Transactions list
     */
    async listTransactions(options = {}) {
        try {
            const {
                page = 1,
                perPage = 50,
                customer = null,
                status = null,
                from = null,
                to = null
            } = options;

            let url = `/transaction?page=${page}&perPage=${perPage}`;

            if (customer) url += `&customer=${customer}`;
            if (status) url += `&status=${status}`;
            if (from) url += `&from=${from}`;
            if (to) url += `&to=${to}`;

            const response = await this.api.get(url);

            if (response.data.status) {
                return {
                    success: true,
                    data: {
                        transactions: response.data.data,
                        meta: response.data.meta
                    },
                    message: 'Transactions retrieved successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to get transactions');
            }
        } catch (error) {
            console.error('Paystack list transactions error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get transactions'
            };
        }
    }

    /**
     * Verify webhook signature
     * @param {string} signature - Webhook signature
     * @param {string} body - Request body
     * @returns {boolean} - Whether signature is valid
     */
    verifyWebhookSignature(signature, body) {
        try {
            if (!paystackConfig.webhookSecret) {
                console.warn('Paystack webhook secret not configured');
                return false;
            }

            const hash = crypto
                .createHmac('sha512', paystackConfig.webhookSecret)
                .update(body)
                .digest('hex');

            return hash === signature;
        } catch (error) {
            console.error('Webhook signature verification error:', error);
            return false;
        }
    }

    /**
     * Process webhook event
     * @param {Object} eventData - Webhook event data
     * @returns {Object} - Processed webhook data
     */
    processWebhookEvent(eventData) {
        try {
            const { event, data } = eventData;

            switch (event) {
                case 'charge.success':
                    return {
                        type: 'payment_success',
                        data: {
                            transactionId: data.id,
                            reference: data.reference,
                            amount: data.amount,
                            amountInNaira: formatAmountFromKobo(data.amount),
                            status: data.status,
                            customer: data.customer,
                            metadata: data.metadata,
                            paidAt: data.paid_at
                        }
                    };

                case 'charge.failed':
                    return {
                        type: 'payment_failed',
                        data: {
                            transactionId: data.id,
                            reference: data.reference,
                            amount: data.amount,
                            amountInNaira: formatAmountFromKobo(data.amount),
                            status: data.status,
                            customer: data.customer,
                            metadata: data.metadata,
                            failureReason: data.gateway_response
                        }
                    };

                default:
                    return {
                        type: 'unknown_event',
                        data: eventData
                    };
            }
        } catch (error) {
            console.error('Webhook event processing error:', error);
            return {
                type: 'processing_error',
                error: error.message,
                data: eventData
            };
        }
    }

    /**
     * Get bank list
     * @returns {Promise<Object>} - Bank list
     */
    async getBanks() {
        try {
            const response = await this.api.get('/bank');

            if (response.data.status) {
                return {
                    success: true,
                    data: response.data.data,
                    message: 'Banks retrieved successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to get banks');
            }
        } catch (error) {
            console.error('Paystack get banks error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get banks'
            };
        }
    }

    /**
     * Resolve bank account number
     * @param {string} accountNumber - Account number
     * @param {string} bankCode - Bank code
     * @returns {Promise<Object>} - Account resolution response
     */
    async resolveBankAccount(accountNumber, bankCode) {
        try {
            if (!accountNumber || !bankCode) {
                throw new Error('Account number and bank code are required');
            }

            const response = await this.api.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);

            if (response.data.status) {
                return {
                    success: true,
                    data: {
                        accountNumber: response.data.data.account_number,
                        accountName: response.data.data.account_name,
                        bankId: response.data.data.bank_id
                    },
                    message: 'Bank account resolved successfully'
                };
            } else {
                throw new Error(response.data.message || 'Failed to resolve bank account');
            }
        } catch (error) {
            console.error('Paystack resolve bank account error:', error);
            return {
                success: false,
                error: error.message || 'Failed to resolve bank account'
            };
        }
    }
}

// Create and export singleton instance
const paystackService = new PaystackService();
export default paystackService;