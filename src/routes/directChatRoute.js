import express from 'express';
import { DirectChatController } from '../controllers/directChatController.js';
import { authenticateToken, requireTenant, requireLandlord, requireAgent } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DirectChatRequest:
 *       type: object
 *       required:
 *         - participantId
 *       properties:
 *         participantId:
 *           type: string
 *           description: ID of the user to chat with
 *         propertyId:
 *           type: string
 *           description: ID of the related property (optional)
 *         subject:
 *           type: string
 *           description: Chat subject or topic
 *           maxLength: 200
 *     
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *         messageType:
 *           type: string
 *           enum: [text, image, document, audio]
 *           default: text
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *     
 *     MarkAsReadRequest:
 *       type: object
 *       required:
 *         - messageIds
 *       properties:
 *         messageIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of message IDs to mark as read
 */

/**
 * @swagger
 * tags:
 *   - name: Direct Chat
 *     description: Real-time chat between landlords, tenants, and agents
 */

// Middleware to allow both landlords and tenants (and agents) to access chat
const requireChatAccess = (req, res, next) => {
    const userRole = req.user?.role;
    if (['landlord', 'tenant', 'agent'].includes(userRole)) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Only landlords, tenants, and agents can access chat.' });
    }
};

/**
 * @swagger
 * /direct-chat:
 *   post:
 *     summary: Create a new chat between participants
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirectChatRequest'
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   $ref: '#/components/schemas/DirectChat'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Participant or property not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, requireChatAccess, DirectChatController.createChat);

/**
 * @swagger
 * /direct-chat:
 *   get:
 *     summary: Get user's active chats
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatType
 *         schema:
 *           type: string
 *           enum: [landlord_tenant, tenant_agent, landlord_agent, group]
 *         description: Filter by chat type
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by property ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of chats to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of user's chats
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
 *                     $ref: '#/components/schemas/DirectChat'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 */
router.get('/', authenticateToken, requireChatAccess, DirectChatController.getUserChats);

/**
 * @swagger
 * /direct-chat/search:
 *   get:
 *     summary: Search chats by content or subject
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: chatType
 *         schema:
 *           type: string
 *           enum: [landlord_tenant, tenant_agent, landlord_agent, group]
 *         description: Filter by chat type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results to return
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
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DirectChat'
 *                 query:
 *                   type: string
 *                 count:
 *                   type: integer
 */
router.get('/search', authenticateToken, requireChatAccess, DirectChatController.searchChats);

/**
 * @swagger
 * /direct-chat/online-users:
 *   get:
 *     summary: Get list of currently online users
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of online users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 onlineUsers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       status:
 *                         type: string
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 */
router.get('/online-users', authenticateToken, requireChatAccess, DirectChatController.getOnlineUsers);

/**
 * @swagger
 * /direct-chat/{chatId}:
 *   get:
 *     summary: Get specific chat details
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   $ref: '#/components/schemas/DirectChat'
 *       404:
 *         description: Chat not found
 *       403:
 *         description: Access denied
 */
router.get('/:chatId', authenticateToken, requireChatAccess, DirectChatController.getChatDetails);

/**
 * @swagger
 * /direct-chat/{chatId}:
 *   patch:
 *     summary: Update chat settings (subject, etc.)
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */
router.patch('/:chatId', authenticateToken, requireChatAccess, DirectChatController.updateChat);

/**
 * @swagger
 * /direct-chat/{chatId}:
 *   delete:
 *     summary: Archive/delete a chat
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/:chatId', authenticateToken, requireChatAccess, DirectChatController.deleteChat);

/**
 * @swagger
 * /direct-chat/{chatId}/messages:
 *   get:
 *     summary: Get chat messages with pagination
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages before this timestamp
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages after this timestamp
 *     responses:
 *       200:
 *         description: Chat messages
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
 *                     $ref: '#/components/schemas/DirectMessage'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *                     before:
 *                       type: string
 *                     after:
 *                       type: string
 */
router.get('/:chatId/messages', authenticateToken, requireChatAccess, DirectChatController.getChatMessages);

/**
 * @swagger
 * /direct-chat/{chatId}/messages:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, document, audio]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
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
 *                   $ref: '#/components/schemas/DirectMessage'
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Access denied
 *       404:
 *         description: Chat not found
 */
router.post('/:chatId/messages', 
    authenticateToken, 
    requireChatAccess, 
    upload.array('files', 5), // Allow up to 5 file attachments
    DirectChatController.sendMessage
);

/**
 * @swagger
 * /direct-chat/{chatId}/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkAsReadRequest'
 *     responses:
 *       200:
 *         description: Messages marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 readMessages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 readAt:
 *                   type: string
 *                   format: date-time
 */
router.post('/:chatId/read', authenticateToken, requireChatAccess, DirectChatController.markAsRead);

// Routes specific to tenants
/**
 * @swagger
 * /direct-chat/tenant/landlords:
 *   get:
 *     summary: Get list of landlords tenant can chat with
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available landlords
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 landlords:
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
 *                       properties:
 *                         type: array
 *                         items:
 *                           type: object
 */
router.get('/tenant/landlords', authenticateToken, requireTenant, async (req, res) => {
    try {
        // Get tenant's applications or leases to find relevant landlords
        const { default: TenantApplication } = await import('../models/TenantApplication.js');
        const { default: User } = await import('../models/User.js');
        
        const tenantId = req.user.userId;
        
        // Find applications or current leases
        const applications = await TenantApplication.find({ 
            tenantId,
            status: { $in: ['approved', 'pending'] }
        }).populate('propertyId');
        
        const landlordIds = [...new Set(applications.map(app => app.propertyId?.landlordId).filter(Boolean))];
        
        const landlords = await User.find({
            _id: { $in: landlordIds },
            role: 'landlord',
            isActive: true
        }).select('firstName lastName email');
        
        res.json({
            success: true,
            landlords
        });
        
    } catch (error) {
        console.error('Get landlords error:', error);
        res.status(500).json({ error: 'Failed to fetch landlords' });
    }
});

// Routes specific to landlords
/**
 * @swagger
 * /direct-chat/landlord/tenants:
 *   get:
 *     summary: Get list of tenants landlord can chat with
 *     tags: [Direct Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by specific property
 *     responses:
 *       200:
 *         description: List of tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tenants:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/landlord/tenants', authenticateToken, requireLandlord, async (req, res) => {
    try {
        const { propertyId } = req.query;
        const landlordId = req.user.userId;
        
        const { default: Property } = await import('../models/Property.js');
        const { default: TenantApplication } = await import('../models/TenantApplication.js');
        const { default: User } = await import('../models/User.js');
        
        // Build query for landlord's properties
        const propertyQuery = { landlordId };
        if (propertyId) {
            propertyQuery._id = propertyId;
        }
        
        const properties = await Property.find(propertyQuery).select('_id propertyName');
        const propertyIds = properties.map(p => p._id);
        
        // Find tenants with applications or current leases
        const applications = await TenantApplication.find({
            propertyId: { $in: propertyIds },
            status: { $in: ['approved', 'pending'] }
        }).populate('tenantId', 'firstName lastName email');
        
        const tenants = applications.map(app => ({
            ...app.tenantId.toObject(),
            propertyId: app.propertyId,
            propertyName: properties.find(p => p._id.toString() === app.propertyId.toString())?.propertyName
        }));
        
        res.json({
            success: true,
            tenants
        });
        
    } catch (error) {
        console.error('Get tenants error:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

export default router;