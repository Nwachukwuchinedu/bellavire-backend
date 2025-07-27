import express from "express"
import { authenticateToken, requireLandlord } from "../middleware/authMiddleware.js";
import {
  getCurrentLandlord,
  updateLandlord,
  getNotificationSettings,
  updateNotificationSettings
} from "../controllers/landlordController.js";

/**
 * @swagger
 * tags:
 *   - name: Landlords
 *     description: Landlord management and operations
 */

const landlordRouter = express.Router()

/**
 * @swagger
 * /landlords/profile:
 *   get:
 *     summary: Get current landlord profile
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Landlord profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Landlord'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
landlordRouter.get("/profile", authenticateToken, requireLandlord, getCurrentLandlord);

/**
 * @swagger
 * /landlords/profile:
 *   patch:
 *     summary: Update current landlord profile
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Landlord profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Landlord'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: array
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/profile", authenticateToken, requireLandlord, updateLandlord);

/**
 * @swagger
 * /landlords/notification-settings:
 *   get:
 *     summary: Get landlord notification settings
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Notification settings object
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.get("/notification-settings", authenticateToken, requireLandlord, getNotificationSettings);

/**
 * @swagger
 * /landlords/notification-settings:
 *   patch:
 *     summary: Update landlord notification settings
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationSettings:
 *                 type: object
 *                 description: Notification settings to update
 *                 properties:
 *                   security:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   newLease:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [instantly, 2min, 5min, 10min, never]
 *                   rentalApplication:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [instantly, 2min, 5min, 10min, never]
 *                   onlinePaymentMade:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   onlinePaymentInitiate:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   onlinePaymentFailed:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   onlinePaymentSuccessful:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   taskAssigned:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   connectionUpdate:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   listingsInquiries:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   newMessages:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportSend:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportUpdate:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportCancelled:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   screeningReportReady:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   invoicePosted:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   invoiceOverdue:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [instantly, 2min, 5min, 10min, never]
 *                   invoiceDue:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   lease:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                       notify:
 *                         type: string
 *                         enum: [60days_before, 30days_before, day_of_expiration, never]
 *                   maintenanceNewRequest:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   maintenanceChange:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   maintenanceMessage:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   maintenanceResolve:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *                   textMessage:
 *                     type: object
 *                     properties:
 *                       feed:
 *                         type: boolean
 *                       email:
 *                         type: boolean
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Updated notification settings
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
landlordRouter.patch("/notification-settings", authenticateToken, requireLandlord, updateNotificationSettings);

export default landlordRouter 