# Paystack Quick Start Guide

This is a simplified guide to get your Paystack payment gateway up and running quickly.

## 🚀 Quick Setup (5 minutes)

### 1. Get Your API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings > API Keys**
3. Copy your **Test Secret Key** and **Test Public Key**

### 2. Set Up Environment Variables

Add these to your `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
BACKEND_BASE_URL=http://localhost:3000
```

### 3. Test Basic Payment (No Webhook Required)

You can test payments immediately without setting up webhooks:

1. Start your server: `npm run dev`
2. Open `paystack-test.html` in your browser
3. Update the `API_BASE_URL` and `AUTH_TOKEN` in the HTML file
4. Try making a test payment

## 🔧 Webhook Setup (Optional for Testing)

Webhooks are only needed for production or if you want real-time payment updates.

### Step 1: Create Webhook

1. Go to **Settings > Webhooks** in Paystack dashboard
2. Click **"Add Webhook"**
3. Set URL: `https://yourapp.com/api/payments/paystack/webhook`
4. Select events: `charge.success`, `charge.failed`
5. Click **"Save"**

### Step 2: Get Webhook Secret

**After saving the webhook**, you'll see a **"Secret"** field. Copy this value.

### Step 3: Add to Environment

```env
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 🧪 Testing

### Test Cards

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| Visa | 4084 0840 8408 4081 | Any future date | Any 3 digits |
| Mastercard | 5105 1051 0510 5100 | Any future date | Any 3 digits |

### Test Locally

1. Use the provided `paystack-test.html` file
2. Update the JavaScript variables:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api';
   const AUTH_TOKEN = 'your-actual-auth-token';
   ```

## 📝 API Endpoints

### Initialize Payment
```
POST /api/payments/paystack/initialize
```

### Verify Payment
```
GET /api/payments/paystack/verify/{reference}
```

### Webhook (if configured)
```
POST /api/payments/paystack/webhook
```

## ❓ Common Issues

**"Webhook secret not found"**
- You only need webhook secret if you're using webhooks
- For basic testing, you can skip webhook setup

**"Invalid API key"**
- Make sure you're using test keys for development
- Check that your keys are copied correctly

**"Payment verification fails"**
- Ensure the payment was actually completed on Paystack
- Check the reference number is correct

## 🎯 Next Steps

1. **Test basic payments** using the HTML test page
2. **Integrate into your frontend** using the API endpoints
3. **Set up webhooks** when ready for production
4. **Switch to live keys** for production

## 📞 Need Help?

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)
- Check the full `PAYSTACK_SETUP.md` for detailed instructions 