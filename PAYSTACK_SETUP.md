# Paystack Payment Gateway Integration

This document provides a comprehensive guide for setting up and using the Paystack payment gateway integration in your Real Estate application.

## Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Environment Variables](#environment-variables)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [Webhook Configuration](#webhook-configuration)
8. [Troubleshooting](#troubleshooting)

## Overview

The Paystack integration provides a complete payment solution for your real estate application, supporting:

- **Payment Initialization**: Create payment transactions
- **Payment Verification**: Verify payment status
- **Webhook Handling**: Real-time payment status updates
- **Customer Management**: Store and manage customer payment methods
- **Multiple Payment Channels**: Card, bank transfer, USSD, mobile money, QR codes

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already included in your `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.7.9",
    "crypto": "^1.0.1"
  }
}
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/payments/paystack/callback

# Backend Configuration
BACKEND_BASE_URL=http://localhost:3000
```

### 3. Get Paystack API Keys

1. Sign up for a Paystack account at [https://paystack.com](https://paystack.com)
2. Go to your dashboard and navigate to Settings > API Keys
3. Copy your test secret key and public key
4. For production, use the live keys instead

### 4. Get Webhook Secret

The webhook secret is generated when you create a webhook endpoint. Here's how to get it:

1. Go to your Paystack dashboard
2. Navigate to Settings > Webhooks
3. Click "Add Webhook" or edit an existing webhook
4. Set your webhook URL: `https://yourapp.com/api/payments/paystack/webhook`
5. Select the events you want to receive (charge.success, charge.failed, etc.)
6. Save the webhook
7. **Important**: After saving, you'll see a "Secret" field. This is your `PAYSTACK_WEBHOOK_SECRET`
8. Copy this secret and add it to your `.env` file

**Note**: If you don't see the secret immediately, try refreshing the page or editing the webhook again. The secret is only shown after the webhook is successfully created.

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key | Yes | `sk_test_...` |
| `PAYSTACK_PUBLIC_KEY` | Your Paystack public key | Yes | `pk_test_...` |
| `PAYSTACK_WEBHOOK_SECRET` | Webhook secret (generated when creating webhook) | Yes | `whsec_...` |
| `PAYSTACK_CALLBACK_URL` | Callback URL for payments | No | `https://yourapp.com/callback` |
| `BACKEND_BASE_URL` | Your backend base URL | Yes | `http://localhost:3000` |

## API Endpoints

### Payment Initialization

**POST** `/api/payments/paystack/initialize`

Initialize a new payment transaction.

**Request Body:**
```json
{
  "amount": 50000,
  "email": "customer@example.com",
  "reference": "PAY_123456789",
  "callbackUrl": "https://yourapp.com/callback",
  "metadata": {
    "description": "Monthly rent payment",
    "propertyId": "60d0fe4f5311236168a109cf",
    "leaseId": "60d0fe4f5311236168a109d0"
  }
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/0x234567890",
    "reference": "PAY_123456789",
    "amount": 50000,
    "paymentId": "60d0fe4f5311236168a109cf"
  },
  "message": "Payment initialized successfully"
}
```

### Payment Verification

**GET** `/api/payments/paystack/verify/{reference}`

Verify the status of a payment transaction.

**Response:**
```json
{
  "status": true,
  "data": {
    "paymentId": "60d0fe4f5311236168a109cf",
    "reference": "PAY_123456789",
    "amount": 50000,
    "status": "success"
  },
  "message": "Payment verified successfully"
}
```

### Webhook Endpoint

**POST** `/api/payments/paystack/webhook`

Handle Paystack webhook events for real-time payment updates.

## Usage Examples

### Frontend Integration

```javascript
// Initialize payment
const initializePayment = async (paymentData) => {
  try {
    const response = await fetch('/api/payments/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    
    if (result.status) {
      // Redirect to Paystack payment page
      window.location.href = result.data.authorizationUrl;
    }
  } catch (error) {
    console.error('Payment initialization failed:', error);
  }
};

// Verify payment
const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`/api/payments/paystack/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Payment verification failed:', error);
  }
};
```

### Backend Integration

```javascript
import paystackService from '../services/paystackService.js';

// Initialize payment
const paymentResult = await paystackService.initializePayment({
  amount: 50000,
  email: 'customer@example.com',
  metadata: {
    description: 'Rent payment',
    propertyId: 'property123'
  }
});

// Verify payment
const verificationResult = await paystackService.verifyPayment('PAY_123456789');

// Create customer
const customerResult = await paystackService.createCustomer({
  email: 'customer@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '08012345678'
});
```

## Testing

### 1. Test Cards

Use these test card numbers for testing:

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa | 4084 0840 8408 4081 | Any future date | Any 3 digits |
| Mastercard | 5105 1051 0510 5100 | Any future date | Any 3 digits |
| Verve | 5061 4603 6000 0008 | Any future date | Any 3 digits |

### 2. Test HTML Page

Use the provided `paystack-test.html` file to test the integration:

1. Update the `API_BASE_URL` and `AUTH_TOKEN` in the HTML file
2. Open the file in a browser
3. Fill in the payment details
4. Click "Initialize Payment"
5. Complete the payment on Paystack's page
6. Verify the payment status

### 3. Test Webhooks

Use tools like ngrok to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use the ngrok URL as your webhook URL in Paystack dashboard
# Example: https://abc123.ngrok.io/api/payments/paystack/webhook
```

**Important**: When testing with ngrok, you'll need to:
1. Update your webhook URL in Paystack dashboard with the ngrok URL
2. Copy the new webhook secret that Paystack generates
3. Update your `.env` file with the new webhook secret

## Webhook Configuration

### 1. Configure Webhook URL

1. Go to your Paystack dashboard
2. Navigate to Settings > Webhooks
3. Click "Add Webhook" or edit an existing webhook
4. Set your webhook URL: `https://yourapp.com/api/payments/paystack/webhook`
5. Select the events you want to receive:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`
   - `transfer.failed`
6. Save the webhook
7. **Copy the webhook secret** that appears after saving - this is your `PAYSTACK_WEBHOOK_SECRET`

### 2. Webhook Events

The integration handles these webhook events:

- **charge.success**: Payment completed successfully
- **charge.failed**: Payment failed
- **transfer.success**: Transfer completed successfully
- **transfer.failed**: Transfer failed

### 3. Webhook Security

Webhooks are secured using HMAC SHA512 signatures. The integration automatically verifies webhook signatures using your `PAYSTACK_WEBHOOK_SECRET`.

## Payment Method Management

### Create Payment Method

```javascript
// Create Stripe payment method
const stripePaymentMethod = {
  type: 'stripe',
  stripeCustomerId: 'cus_123456789',
  stripePaymentMethodId: 'pm_123456789'
};

// Create Paystack payment method
const paystackPaymentMethod = {
  type: 'paystack',
  paystackCustomerCode: 'CUS_123456789',
  paystackAuthorizationCode: 'AUTH_123456789',
  paystackCardType: 'visa',
  paystackLastFour: '1234'
};
```

### Set Default Payment Method

```javascript
// Set default payment method
await fetch('/api/tenants/payment-methods/123/default', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

## Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Ensure your Paystack API keys are correct
   - Check if you're using test keys for development

2. **Webhook Not Receiving Events**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Ensure webhook events are enabled in Paystack dashboard

3. **Payment Verification Fails**
   - Check if the reference exists
   - Verify the payment was actually made
   - Check Paystack dashboard for transaction status

4. **CORS Issues**
   - Ensure your backend allows requests from your frontend domain
   - Check CORS configuration in your Express app

### Debug Mode

Enable debug logging by setting the environment variable:

```env
DEBUG=paystack:*
```

### Support

For Paystack-specific issues:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)

For integration issues:
- Check the application logs
- Verify environment variables
- Test with the provided HTML test page

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures** before processing events
3. **Use HTTPS** in production
4. **Validate all input data** before processing payments
5. **Implement proper error handling** for failed payments
6. **Store sensitive data securely** in your database

## Production Checklist

- [ ] Use live Paystack API keys
- [ ] Configure production webhook URL
- [ ] Set up proper SSL certificates
- [ ] Test all payment flows
- [ ] Implement proper error handling
- [ ] Set up monitoring and logging
- [ ] Configure backup webhook endpoints
- [ ] Test webhook signature verification
- [ ] Implement retry logic for failed payments
- [ ] Set up payment reconciliation processes 