import express from 'express';
import { sendContactMessage } from '../controllers/contactUsController.js';
import { createRateLimiter } from '../middleware/rateLimiterMiddleware.js';

const router = express.Router();

const contactLimiter = createRateLimiter({
    windowMs: 60 * 60 * 24 * 1000, // 1 day
    max: 3, // limit each IP to 3 requests per windowMs
    message: `Too many contact requests, please try again later.`
});

/**
 * @swagger
 * /contact-us:
 *   post:
 *     summary: Send a contact us message
 *     tags: [ContactUs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - message
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/contact-us', contactLimiter, sendContactMessage);

export default router;
