import express from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authenticateToken, requireTenant, requireLandlord } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: Tenant-Landlord messaging endpoints
 */

/**
 * @swagger
 * /chat/send:
 *   post:
 *     summary: Send a message to another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - recipientType
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID of the recipient (tenant or landlord)
 *               recipientType:
 *                 type: string
 *                 enum: [tenant, landlord]
 *                 description: Type of recipient
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Message content
 *               propertyId:
 *                 type: string
 *                 description: Optional property ID for context
 *     responses:
 *       200:
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatId:
 *                       type: string
 *                     message:
 *                       type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipient not found
 *       500:
 *         description: Internal server error
 */
router.post('/send', authenticateToken, ChatController.sendMessage);

/**
 * @swagger
 * /chat/history/{chatId}:
 *   get:
 *     summary: Get chat history by chatId
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       $ref: '#/components/schemas/Chat'
 *                     otherParty:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No access to this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get('/history/:chatId', authenticateToken, ChatController.getChatHistory);

/**
 * @swagger
 * /chat/history/{chatId}/paginated:
 *   get:
 *     summary: Get paginated chat history by chatId
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: Chat ID
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Return messages before this timestamp
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Return messages after this timestamp
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         required: false
 *         description: Number of messages to return
 *     responses:
 *       200:
 *         description: Paginated chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                     hasMoreBefore:
 *                       type: boolean
 *                     hasMoreAfter:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No access to this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.get('/history/:chatId/paginated', authenticateToken, ChatController.getChatHistoryPaginated);

/**
 * @swagger
 * /chat/user:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User chats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Chat'
 *                     userType:
 *                       type: string
 *                       enum: [tenant, landlord]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user', authenticateToken, ChatController.getUserChats);

/**
 * @swagger
 * /chat/{chatId}/mark-read:
 *   patch:
 *     summary: Mark messages as read in a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - No access to this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:chatId/mark-read', authenticateToken, ChatController.markMessagesAsRead);

/**
 * @swagger
 * /chat/unread-count:
 *   get:
 *     summary: Get unread message count for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /chat/search-users:
 *   get:
 *     summary: Search for users to start a chat with
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (name or email)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [tenant, landlord]
 *         required: true
 *         description: Role of users to search for
 *     responses:
 *       200:
 *         description: Users found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/search-users', authenticateToken, ChatController.searchUsers);

router.get('/unread-count', authenticateToken, ChatController.getUnreadCount);

export default router;
