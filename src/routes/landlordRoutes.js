import express from "express";
import {
  authenticateToken,
  requireLandlord,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getCurrentLandlord,
  updateLandlord,
  getNotificationSettings,
  updateNotificationSettings,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenanceStatus,
  assignContractor,
  removeContractor,
  getAllLeases,
  getLeaseById,
  terminateLease,
  // Lease document controllers
  uploadLeaseDocument,
  // Tour controllers
  getMyTours,
  getTourById,
  updateTourStatus,
  rescheduleTour,
  getTourCalendar,
  // Notification controllers
  getLandlordNotifications,
  markLandlordNotificationAsReadById,
  markAllLandlordNotificationsAsRead,
  getUnreadLandlordNotificationCount,
  searchLandlordNotifications,
  // Application controllers
  getAllApplications,
  getApplicationById,
  respondToApplication,
  getPropertyApplications,
  // Room management controllers
  getPropertyRooms,
  addRoomToProperty,
  updateRoom,
  deleteRoom,
  getRoomById,
} from "../controllers/landlord/index.js";

import {
  sendMessage,
  getChatHistory,
  getChatHistoryPaginated,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount
} from "../controllers/chatController.js";

const landlordRouter = express.Router();

// Profile routes
landlordRouter.get(
  "/profile",
  authenticateToken,
  requireLandlord,
  getCurrentLandlord
);
landlordRouter.patch(
  "/profile",
  authenticateToken,
  requireLandlord,
  updateLandlord
);

// Notification settings routes
landlordRouter.get(
  "/notification-settings",
  authenticateToken,
  requireLandlord,
  getNotificationSettings
);
landlordRouter.patch(
  "/notification-settings",
  authenticateToken,
  requireLandlord,
  updateNotificationSettings
);

// Property routes
landlordRouter.get(
  "/properties",
  authenticateToken,
  requireLandlord,
  getAllProperties
);
landlordRouter.get(
  "/search-properties",
  authenticateToken,
  requireLandlord,
  searchProperties
);
landlordRouter.get(
  "/properties/:id",
  authenticateToken,
  requireLandlord,
  getPropertyById
);
landlordRouter.post(
  "/properties",
  authenticateToken,
  requireLandlord,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "propertyImages", maxCount: 10 },
  ]),
  createProperty
);
landlordRouter.patch(
  "/properties/:id",
  authenticateToken,
  requireLandlord,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "propertyImages", maxCount: 10 },
  ]),
  updateProperty
);
landlordRouter.delete(
  "/properties/:id",
  authenticateToken,
  requireLandlord,
  deleteProperty
);

// Room management routes
landlordRouter.get(
  "/properties/:propertyId/rooms",
  authenticateToken,
  requireLandlord,
  getPropertyRooms
);
landlordRouter.post(
  "/properties/:propertyId/rooms",
  authenticateToken,
  requireLandlord,
  addRoomToProperty
);
landlordRouter.get(
  "/properties/:propertyId/rooms/:roomId",
  authenticateToken,
  requireLandlord,
  getRoomById
);
landlordRouter.put(
  "/properties/:propertyId/rooms/:roomId",
  authenticateToken,
  requireLandlord,
  updateRoom
);
landlordRouter.delete(
  "/properties/:propertyId/rooms/:roomId",
  authenticateToken,
  requireLandlord,
  deleteRoom
);

// Maintenance routes
landlordRouter.get(
  "/maintenances",
  authenticateToken,
  requireLandlord,
  getAllMaintenances
);
landlordRouter.get(
  "/maintenances/:id",
  authenticateToken,
  requireLandlord,
  getMaintenanceById
);
landlordRouter.patch(
  "/maintenances/:id",
  authenticateToken,
  requireLandlord,
  updateMaintenanceStatus
);
landlordRouter.post(
  "/maintenances/:id/assign-contractor",
  authenticateToken,
  requireLandlord,
  assignContractor
);
landlordRouter.delete(
  "/maintenances/:id/remove-contractor",
  authenticateToken,
  requireLandlord,
  removeContractor
);

// Lease routes
landlordRouter.get("/leases", authenticateToken, requireLandlord, getAllLeases);
landlordRouter.get(
  "/leases/:id",
  authenticateToken,
  requireLandlord,
  getLeaseById
);
landlordRouter.patch(
  "/leases/:id/terminate",
  authenticateToken,
  requireLandlord,
  terminateLease
);

// Tour routes
landlordRouter.get("/tours", authenticateToken, requireLandlord, getMyTours);
landlordRouter.get(
  "/tours/calendar",
  authenticateToken,
  requireLandlord,
  getTourCalendar
);
landlordRouter.get(
  "/tours/:tourId",
  authenticateToken,
  requireLandlord,
  getTourById
);
landlordRouter.patch(
  "/tours/:tourId/status",
  authenticateToken,
  requireLandlord,
  updateTourStatus
);
landlordRouter.patch(
  "/tours/:tourId/reschedule",
  authenticateToken,
  requireLandlord,
  rescheduleTour
);

// Notification routes
landlordRouter.get(
  "/notifications",
  authenticateToken,
  requireLandlord,
  getLandlordNotifications
);
landlordRouter.get(
  "/search-notifications",
  authenticateToken,
  requireLandlord,
  searchLandlordNotifications
);
landlordRouter.patch(
  "/notifications/:id/read",
  authenticateToken,
  requireLandlord,
  markLandlordNotificationAsReadById
);
landlordRouter.patch(
  "/notifications/mark-all-read",
  authenticateToken,
  requireLandlord,
  markAllLandlordNotificationsAsRead
);
landlordRouter.get(
  "/notifications/unread-count",
  authenticateToken,
  requireLandlord,
  getUnreadLandlordNotificationCount
);

// Application routes
landlordRouter.get(
  "/tenant-applications",
  authenticateToken,
  requireLandlord,
  getAllApplications
);
landlordRouter.get(
  "/tenant-applications/:applicationId",
  authenticateToken,
  requireLandlord,
  getApplicationById
);
landlordRouter.patch(
  "/tenant-applications/:applicationId/respond",
  authenticateToken,
  requireLandlord,
  respondToApplication
);
landlordRouter.get(
  "/properties/:propertyId/tenant-applications",
  authenticateToken,
  requireLandlord,
  getPropertyApplications
);

// Document routes
landlordRouter.post(
  "/lease-document",
  authenticateToken,
  requireLandlord,
  upload.single("leaseDocument"),
  uploadLeaseDocument
);

// Chat routes
/**
 * @swagger
 * /landlords/chat/send:
 *   post:
 *     summary: Send a message to a tenant
 *     tags: [Landlords]
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
 *                 description: ID of the tenant to send message to
 *               recipientType:
 *                 type: string
 *                 enum: [tenant]
 *                 description: Type of recipient (must be tenant for landlords)
 *               content:
 *                 type: string
 *                 description: Message content
 *               propertyId:
 *                 type: string
 *                 description: Optional property ID for context
 *     responses:
 *       201:
 *         description: Message sent successfully
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
 *                   example: "Message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatId:
 *                       type: string
 *                     message:
 *                       type: object
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
landlordRouter.post("/chat/send", authenticateToken, requireLandlord, sendMessage);

/**
 * @swagger
 * /landlords/chat/user:
 *   get:
 *     summary: Get all chats for the current landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chats retrieved successfully
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
 *                   example: "Chats retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chats:
 *                       type: array
 *                       items:
 *                         type: object
 *                     userType:
 *                       type: string
 *                       example: "landlord"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
landlordRouter.get("/chat/user", authenticateToken, requireLandlord, getUserChats);

/**
 * @swagger
 * /landlords/chat/history/{chatId}:
 *   get:
 *     summary: Get chat history for a specific chat
 *     tags: [Landlords]
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
 *         description: Chat history retrieved successfully
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
 *                   example: "Chat history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chat:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/chat/history/:chatId", authenticateToken, requireLandlord, getChatHistory);

/**
 * @swagger
 * /landlords/chat/history/{chatId}/paginated:
 *   get:
 *     summary: Get paginated chat history for a specific chat
 *     tags: [Landlords]
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Paginated chat history retrieved successfully
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
 *                   example: "Chat history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/chat/history/:chatId/paginated", authenticateToken, requireLandlord, getChatHistoryPaginated);

/**
 * @swagger
 * /landlords/chat/{chatId}/mark-read:
 *   patch:
 *     summary: Mark messages as read in a specific chat
 *     tags: [Landlords]
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
 *         description: Messages marked as read successfully
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
 *                   example: "Messages marked as read"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/chat/:chatId/mark-read", authenticateToken, requireLandlord, markMessagesAsRead);

/**
 * @swagger
 * /landlords/chat/unread-count:
 *   get:
 *     summary: Get total unread message count for the current landlord
 *     tags: [Landlords]
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
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Unread count retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
landlordRouter.get("/chat/unread-count", authenticateToken, requireLandlord, getUnreadCount);

export default landlordRouter;
