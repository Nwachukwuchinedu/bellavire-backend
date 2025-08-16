import express from 'express';
import { authenticateToken, requireTenant } from '../middleware/authMiddleware.js';
import {
    initializePayment,
    verifyPayment,
    handleWebhook
} from '../controllers/paystackController.js';

const paystackRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Paystack Payments
 *     description: Paystack payment gateway operations
 */

/**
 * @swagger
 * /payments/paystack/initialize:
 *   post:
 *     summary: Initialize a Paystack payment
 *     description: Initialize a payment transaction with Paystack
 *     tags: [Paystack Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - email
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in Naira
 *                 example: 50000
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email address
 *                 example: "customer@example.com"
 *               reference:
 *                 type: string
 *                 description: Custom payment reference (optional)
 *                 example: "PAY_123456789"
 *               callbackUrl:
 *                 type: string
 *                 description: Custom callback URL (optional)
 *                 example: "https://yourapp.com/payment/callback"
 *               metadata:
 *                 type: object
 *                 description: Additional payment metadata
 *                 properties:
 *                   description:
 *                     type: string
 *                     description: Payment description
 *                     example: "Monthly rent payment"
 *                   propertyId:
 *                     type: string
 *                     description: Property ID
 *                     example: "60d0fe4f5311236168a109cf"
 *                   leaseId:
 *                     type: string
 *                     description: Lease ID
 *                     example: "60d0fe4f5311236168a109d0"
 *           example:
 *             amount: 50000
 *             email: "tenant@example.com"
 *             metadata:
 *               description: "Monthly rent payment for July 2025"
 *               propertyId: "60d0fe4f5311236168a109cf"
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizationUrl:
 *                       type: string
 *                       description: URL to redirect user for payment
 *                       example: "https://checkout.paystack.com/0x234567890"
 *                     reference:
 *                       type: string
 *                       description: Payment reference
 *                       example: "PAY_123456789"
 *                     amount:
 *                       type: number
 *                       description: Payment amount in Naira
 *                       example: 50000
 *                     paymentId:
 *                       type: string
 *                       description: Internal payment ID
 *                       example: "60d0fe4f5311236168a109cf"
 *                 message:
 *                   type: string
 *                   example: "Payment initialized successfully"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Amount and email are required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
paystackRouter.post('/initialize', authenticateToken, requireTenant, initializePayment);

/**
 * @swagger
 * /payments/paystack/verify/{reference}:
 *   get:
 *     summary: Verify a Paystack payment
 *     description: Verify the status of a payment transaction
 *     tags: [Paystack Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference from Paystack
 *         example: "PAY_123456789"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       description: Internal payment ID
 *                       example: "60d0fe4f5311236168a109cf"
 *                     reference:
 *                       type: string
 *                       description: Payment reference
 *                       example: "PAY_123456789"
 *                     amount:
 *                       type: number
 *                       description: Payment amount in Naira
 *                       example: 50000
 *                     status:
 *                       type: string
 *                       description: Payment status
 *                       example: "success"
 *                 message:
 *                   type: string
 *                   example: "Payment verified successfully"
 *       400:
 *         description: Bad request - verification failed
 *       404:
 *         description: Payment record not found
 *       500:
 *         description: Internal server error
 */
paystackRouter.get('/verify/:reference', authenticateToken, requireTenant, verifyPayment);

/**
 * @swagger
 * /payments/paystack/webhook:
 *   post:
 *     summary: Paystack webhook endpoint
 *     description: Handle Paystack webhook events for payment status updates
 *     tags: [Paystack Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Webhook event type
 *                 example: "charge.success"
 *               data:
 *                 type: object
 *                 description: Event data
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Internal server error
 */
paystackRouter.post('/webhook', handleWebhook);

export default paystackRouter; 