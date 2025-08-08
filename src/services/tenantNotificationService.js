import Notification from '../models/Notification.js';
import Tenant from '../models/Tenant.js';
import { sendEmail } from './emailService.js';

/**
 * Create a notification for a tenant
 * @param {Object} params
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.type - Notification type
 * @param {string} params.message - Notification message
 * @param {string} params.link - Optional link
 * @returns {Promise<Object>} Created notification
 */
export const createTenantNotification = async ({ tenantId, type, message, link = null }) => {
    try {
        const notification = new Notification({
            recipient: tenantId,
            userRole: 'tenant',
            type,
            message,
            link,
            read: false
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating tenant notification:', error);
        throw error;
    }
};

/**
 * Send email notification to tenant if they have email notifications enabled
 * @param {Object} params
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.notificationType - Type of notification (e.g., 'maintenanceUpdates')
 * @param {string} params.subject - Email subject
 * @param {string} params.htmlContent - Email HTML content
 * @returns {Promise<boolean>} Whether email was sent
 */
export const sendTenantEmailNotification = async ({ tenantId, notificationType, subject, htmlContent }) => {
    try {
        // Get tenant with notification preferences
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            console.error('Tenant not found for email notification:', tenantId);
            return false;
        }

        // Check if tenant has email notifications enabled for this type
        const notificationSettings = tenant.notifications?.[notificationType];
        if (!notificationSettings?.email) {
            console.log(`Email notifications disabled for tenant ${tenantId}, type: ${notificationType}`);
            return false;
        }

        // Send email
        const result = await sendEmail({
            to: tenant.email,
            subject,
            html: htmlContent
        });

        if (result.success) {
            console.log(`Email notification sent to tenant ${tenantId}: ${subject}`);
            return true;
        } else {
            console.error(`Failed to send email notification to tenant ${tenantId}:`, result.error);
            return false;
        }
    } catch (error) {
        console.error('Error sending tenant email notification:', error);
        return false;
    }
};

/**
 * Get notifications for a tenant with pagination
 * @param {string} tenantId - Tenant ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.filter - Filter by read status ('all', 'read', 'unread')
 * @returns {Promise<Object>} Notifications with pagination info
 */
export const getTenantNotifications = async (tenantId, options = {}) => {
    try {
        const { page = 1, limit = 10, filter = 'all' } = options;
        const skip = (page - 1) * limit;

        // Build query
        let query = { recipient: tenantId, userRole: 'tenant' };
        
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
        console.error('Error getting tenant notifications:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} tenantId - Tenant ID (for security)
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId, tenantId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: tenantId, userRole: 'tenant' },
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
 * Mark all notifications as read for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} Update result
 */
export const markAllNotificationsAsRead = async (tenantId) => {
    try {
        const result = await Notification.updateMany(
            { recipient: tenantId, userRole: 'tenant', read: false },
            { read: true }
        );

        return result;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Get unread notification count for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadNotificationCount = async (tenantId) => {
    try {
        const count = await Notification.countDocuments({
            recipient: tenantId,
            userRole: 'tenant',
            read: false
        });

        return count;
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        throw error;
    }
}; 