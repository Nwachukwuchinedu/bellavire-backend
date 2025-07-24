import express from 'express';
import { subscribeToNewsletter } from '../controllers/newsLetterContoller.js';

const router = express.Router();

/**
 * @swagger
 * /newsletter/subscribe:
 *   post:
 *     summary: Subscribe to the newsletter
 *     tags: [NewsLetter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscribed successfully
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
 *         description: Validation error or already subscribed
 *       500:
 *         description: Server error
 */
router.post('/newsletter/subscribe', subscribeToNewsletter);

export default router;
