import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';
import { sendEmail } from './emailService.js';

/**
 * Create a notification for any user type
 * @param {Object} params
 * @param {string} params.userId - User ID (unified approach)
 * @param {string} params.recipientId - Recipient ID (backward compatibility)
 * @param {string} params.userRole - User role ('admin', 'tenant', 'landlord', 'agent')
 * @param {string} params.type - Notification type
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.link - Optional link
 * @param {Object} params.data - Additional data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async ({ 
    userId, 
    recipientId, 
    userRole, 
    type, 
    title, 
    message, 
    link = null, 
    data = {} 
}) => {
    try {
        // Use userId if provided, otherwise use recipientId for backward compatibility
        const targetUserId = userId || recipientId;
        
        const notification = new Notification({
            recipient: targetUserId,
            userRole,
            type,
            title: title || 'Notification',
            message,
            link,
            data,
            read: false
        });

        await notification.save();
        
        // Emit real-time notification if Socket.IO is available
        await emitRealTimeNotification(targetUserId, notification);
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Emit real-time notification via Socket.IO
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 */
const emitRealTimeNotification = async (userId, notification) => {
    try {
        // Import dynamically to avoid circular dependency
        const { default: realTimeChatService } = await import('./realTimeChatService.js');
        
        const socket = realTimeChatService.getSocketByUserId(userId);
        if (socket) {
            socket.emit('new_notification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                link: notification.link,
                data: notification.data,
                createdAt: notification.createdAt,
                read: notification.read
            });
        }
    } catch (error) {
        console.error('Error emitting real-time notification:', error);
    }
};

/**
 * Create chat-specific notifications
 * @param {Object} params
 * @param {string} params.userId - Recipient user ID
 * @param {string} params.chatId - Chat ID
 * @param {string} params.senderId - Sender user ID
 * @param {string} params.senderName - Sender name
 * @param {string} params.messageContent - Message content preview
 * @param {string} params.chatType - Type of chat
 * @returns {Promise<Object>} Created notification
 */
export const createChatNotification = async ({
    userId,
    chatId,
    senderId,
    senderName,
    messageContent,
    chatType = 'direct_chat'
}) => {
    try {
        // Get user to determine role
        const user = await User.findById(userId).select('role firstName lastName');
        if (!user) {
            throw new Error('User not found');
        }
        
        const notification = await createNotification({
            userId,
            userRole: user.role,
            type: 'new_message',
            title: 'New Message',
            message: `${senderName}: ${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`,
            link: `/chat/${chatId}`,
            data: {
                chatId,
                senderId,
                senderName,
                chatType,
                messagePreview: messageContent.substring(0, 100)
            }
        });
        
        // Send email notification if enabled
        await sendChatEmailNotification({
            userId,
            userRole: user.role,
            senderName,
            messageContent,
            chatId
        });
        
        return notification;
    } catch (error) {
        console.error('Error creating chat notification:', error);
        throw error;
    }
};

/**
 * Send email notification for chat messages
 * @param {Object} params
 * @param {string} params.userId - Recipient user ID
 * @param {string} params.userRole - User role
 * @param {string} params.senderName - Sender name
 * @param {string} params.messageContent - Message content
 * @param {string} params.chatId - Chat ID
 */
const sendChatEmailNotification = async ({
    userId,
    userRole,
    senderName,
    messageContent,
    chatId
}) => {
    try {
        let user;
        let emailEnabled = false;
        
        // Check if user has email notifications enabled for chat
        switch (userRole) {
            case 'tenant':
                user = await Tenant.findById(userId);
                emailEnabled = user?.notifications?.messages?.email || false;
                break;
            case 'landlord':
                user = await Landlord.findById(userId);
                emailEnabled = user?.notificationSettings?.messages?.email || false;
                break;
            case 'agent':
            case 'admin':
                user = await User.findById(userId);
                emailEnabled = true; // Default to true for agents and admins
                break;
        }
        
        if (!user || !emailEnabled) {
            return;
        }
        
        const subject = `New message from ${senderName}`;
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Message</h2>
                <p>You have received a new message from <strong>${senderName}</strong>:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 0; font-style: italic;">${messageContent}</p>
                </div>
                <p>
                    <a href="${process.env.FRONTEND_URL}/chat/${chatId}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        View Message
                    </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    You can disable these notifications in your account settings.
                </p>
            </div>
        `;
        
        await sendEmail({
            to: user.email,
            subject,
            html: htmlContent
        });
        
    } catch (error) {
        console.error('Error sending chat email notification:', error);
    }
};

/**
 * Broadcast notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data
 */
export const broadcastNotification = async (userIds, notificationData) => {
    try {
        const notifications = [];
        
        for (const userId of userIds) {
            const user = await User.findById(userId).select('role');
            if (user) {
                const notification = await createNotification({
                    userId,
                    userRole: user.role,
                    ...notificationData
                });
                notifications.push(notification);
            }
        }
        
        return notifications;
    } catch (error) {
        console.error('Error broadcasting notifications:', error);
        throw error;
    }
};

/**
 * Get real-time notification summary for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Notification summary
 */
export const getNotificationSummary = async (userId) => {
    try {
        const user = await User.findById(userId).select('role');
        if (!user) {
            throw new Error('User not found');
        }
        
        const [unreadCount, recentNotifications] = await Promise.all([
            Notification.countDocuments({
                recipient: userId,
                userRole: user.role,
                read: false
            }),
            Notification.find({
                recipient: userId,
                userRole: user.role
            })
            .sort({ createdAt: -1 })
            .limit(5)
        ]);
        
        return {
            unreadCount,
            recentNotifications
        };
    } catch (error) {
        console.error('Error getting notification summary:', error);
        throw error;
    }
};

/**
 * Send email notification to user if they have email notifications enabled
 * @param {Object} params
 * @param {string} params.recipientId - Recipient ID
 * @param {string} params.userRole - User role ('admin', 'tenant', 'landlord')
 * @param {string} params.notificationType - Type of notification (e.g., 'maintenanceUpdates')
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlContent - Email HTML content
 * @returns {Promise<boolean>} Whether email was sent
 */
export const sendEmailNotification = async ({ recipientId, userRole, notificationType, subject, htmlContent }) => {
    try {
        let user;
        let emailNotificationsEnabled = false;

        // Get user based on role
        switch (userRole) {
            case 'tenant':
                user = await Tenant.findById(recipientId);
                if (user?.notifications?.[notificationType]?.email) {
                    emailNotificationsEnabled = true;
                }
                break;
            case 'landlord':
                user = await Landlord.findById(recipientId);
                if (user?.notificationSettings?.[notificationType]?.email) {
                    emailNotificationsEnabled = true;
                }
                break;
            case 'admin':
                user = await Admin.findById(recipientId);
                // Admins might have different notification settings
                emailNotificationsEnabled = true; // Default to true for admins
                break;
            default:
                console.error('Invalid user role for email notification:', userRole);
                return false;
        }

        if (!user) {
            console.error(`${userRole} not found for email notification:`, recipientId);
            return false;
        }

        if (!emailNotificationsEnabled) {
            console.log(`Email notifications disabled for ${userRole} ${recipientId}, type: ${notificationType}`);
            return false;
        }

        // Send email
        const result = await sendEmail({
            to: user.email,
            subject,
            html: htmlContent
        });

        if (result.success) {
            console.log(`Email notification sent to ${userRole} ${recipientId}: ${subject}`);
            return true;
        } else {
            console.error(`Failed to send email notification to ${userRole} ${recipientId}:`, result.error);
            return false;
        }
    } catch (error) {
        console.error('Error sending email notification:', error);
        return false;
    }
};

/**
 * Get notifications for any user type with pagination
 * @param {string} recipientId - Recipient ID
 * @param {string} userRole - User role ('admin', 'tenant', 'landlord')
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.filter - Filter by read status ('all', 'read', 'unread')
 * @returns {Promise<Object>} Notifications with pagination info
 */
export const getNotifications = async (recipientId, userRole, options = {}) => {
    try {
        const { page = 1, limit = 10, filter = 'all' } = options;
        const skip = (page - 1) * limit;

        // Build query
        let query = { recipient: recipientId, userRole };
        
        if (filter === 'read') {
            query.read = true;
        } else if (filter === 'unread') {
            query.read = false;
        }

        // Get notifications and total count
        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments(query)
        ]);

        return {
            notifications,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} recipientId - Recipient ID (for security)
 * @param {string} userRole - User role (for security)
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId, recipientId, userRole) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: recipientId, userRole },
            { read: true },
            { new: true }
        );

        if (!notification) {
            throw new Error('Notification not found or unauthorized');
        }

        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 * @param {string} recipientId - Recipient ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} Update result
 */
export const markAllNotificationsAsRead = async (recipientId, userRole) => {
    try {
        const result = await Notification.updateMany(
            { recipient: recipientId, userRole, read: false },
            { read: true }
        );

        return result;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Get unread notification count for a user
 * @param {string} recipientId - Recipient ID
 * @param {string} userRole - User role
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadNotificationCount = async (recipientId, userRole) => {
    try {
        const count = await Notification.countDocuments({
            recipient: recipientId,
            userRole,
            read: false
        });

        return count;
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        throw error;
    }
};

/**
 * Create notification for multiple recipients
 * @param {Array} recipients - Array of recipient objects
 * @param {string} recipients[].recipientId - Recipient ID
 * @param {string} recipients[].userRole - User role
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {string} link - Optional link
 * @returns {Promise<Array>} Created notifications
 */
export const createNotificationsForMultipleRecipients = async (recipients, type, message, link = null) => {
    try {
        const notifications = recipients.map(({ recipientId, userRole }) => ({
            recipient: recipientId,
            userRole,
            type,
            message,
            link,
            read: false
        }));

        const createdNotifications = await Notification.insertMany(notifications);
        return createdNotifications;
    } catch (error) {
        console.error('Error creating notifications for multiple recipients:', error);
        throw error;
    }
};

// Legacy functions for backward compatibility
export const createTenantNotification = async ({ tenantId, type, message, link = null }) => {
    return createNotification({ recipientId: tenantId, userRole: 'tenant', type, message, link });
};

export const sendTenantEmailNotification = async ({ tenantId, notificationType, subject, htmlContent }) => {
    return sendEmailNotification({ recipientId: tenantId, userRole: 'tenant', notificationType, subject, htmlContent });
};

export const getTenantNotifications = async (tenantId, options = {}) => {
    return getNotifications(tenantId, 'tenant', options);
};

export const getUnreadNotificationCountForTenant = async (tenantId) => {
    return getUnreadNotificationCount(tenantId, 'tenant');
};

// Export as named exports and default export for flexibility
export const notificationService = {
    createNotification,
    createChatNotification,
    broadcastNotification,
    getNotificationSummary,
    sendEmailNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationCount,
    createNotificationsForMultipleRecipients,
    // Legacy functions
    createTenantNotification,
    sendTenantEmailNotification,
    getTenantNotifications,
    getUnreadNotificationCountForTenant
};

export default notificationService; 