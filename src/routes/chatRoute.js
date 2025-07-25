import express from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Tenants
 *     description: Chatbot and document endpoints
 */

/**
 * @swagger
 * /chat/chat:
 *   post:
 *     summary: Send a message to the chatbot
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Message'
 *               userId:
 *                 type: string
 *               chatId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chatbot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: string
 *                 sources:
 *                   type: array
 *                   items:
 *                     type: object
 *                 hasRelevantContext:
 *                   type: boolean
 *                 chatId:
 *                   type: string
 */
router.post('/chat', authenticateToken, ChatController.chat);

/**
 * @swagger
 * /chat/history/{chatId}:
 *   get:
 *     summary: Get chat history by chatId
 *     tags: [Tenants]
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
 *         description: Chat history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 */
router.get('/history/:chatId', authenticateToken, ChatController.getChatHistory);

/**
 * @swagger
 * /chat/history/{chatId}/paginated:
 *   get:
 *     summary: Get paginated chat history by chatId
 *     tags: [Tenants]
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
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of messages to return (default 20)
 *     responses:
 *       200:
 *         description: Paginated chat history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 hasMore:
 *                   type: boolean
 */
router.get('/history/:chatId/paginated', authenticateToken, ChatController.getChatHistoryPaginated);

/**
 * @swagger
 * /chat/user:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 */
router.get('/user', authenticateToken, ChatController.getUserChats);

/**
 * @swagger
 * /chat/user/{userId}:
 *   get:
 *     summary: Get all chats for a user
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 */
router.get('/user/:userId', authenticateToken, ChatController.getUserChats);

/**
 * @swagger
 * /chat/documents:
 *   post:
 *     summary: Add a new document for chatbot context
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Document'
 *     responses:
 *       200:
 *         description: Document added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 documentId:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post('/documents', authenticateToken, ChatController.addDocument);

/**
 * @swagger
 * /chat/documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 */
router.get('/documents', authenticateToken, ChatController.getAllDocuments);

/**
 * @swagger
 * /chat/search:
 *   post:
 *     summary: Search relevant document chunks
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chunk'
 */
router.post('/search', authenticateToken, ChatController.search);

export default router;
