import Notification from '../models/Notification.js';
import Tenant from '../models/Tenant.js';
import Landlord from '../models/Landlord.js';
import Admin from '../models/Admin.js';
import { sendEmail } from './emailService.js';

/**
 * Create a notification for any user type
 * @param {Object} params
 * @param {string} params.recipientId - Recipient ID
 * @param {string} params.userRole - User role ('admin', 'tenant', 'landlord')
 * @param {string} params.type - Notification type
 * @param {string} params.message - Notification message
 * @param {string} params.link - Optional link
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async ({ recipientId, userRole, type, message, link = null }) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            userRole,
            type,
            message,
            link,
            read: false
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
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