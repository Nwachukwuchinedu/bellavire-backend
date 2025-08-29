import Notification from "../../models/Notification.js";
import Agent from "../../models/Agent.js";

/**
 * Get notifications for an agent
 * @param {string} agentId - Agent ID
 * @param {Object} options - Filter and pagination options
 * @returns {Object} - Notifications with pagination
 */
export const getAgentNotifications = async (agentId, options = {}) => {
  const { page = 1, limit = 10, read = null, type = "", search = "" } = options;

  const skip = (page - 1) * limit;

  // Build filters
  let filters = {
    recipient: agentId,
    userRole: "agent",
  };

  if (read !== null) {
    filters.read = read === "true" || read === true;
  }

  if (type && type !== "all") {
    filters.type = type;
  }

  if (search) {
    filters.message = { $regex: search, $options: "i" };
  }

  // Get notifications with pagination
  const notifications = await Notification.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const totalNotifications = await Notification.countDocuments(filters);

  return {
    notifications,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(totalNotifications / limit),
      count: totalNotifications,
      perPage: parseInt(limit),
    },
  };
};

/**
 * Mark notification as read
 * @param {string} agentId - Agent ID
 * @param {string} notificationId - Notification ID
 * @returns {Object} - Updated notification
 */
export const markNotificationAsRead = async (agentId, notificationId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: agentId,
    userRole: "agent",
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.read = true;
  await notification.save();

  return notification.toObject();
};

/**
 * Mark all notifications as read for an agent
 * @param {string} agentId - Agent ID
 * @returns {Object} - Update result
 */
export const markAllNotificationsAsRead = async (agentId) => {
  const result = await Notification.updateMany(
    {
      recipient: agentId,
      userRole: "agent",
      read: false,
    },
    { read: true }
  );

  return {
    modifiedCount: result.modifiedCount,
    message: `${result.modifiedCount} notifications marked as read`,
  };
};

/**
 * Get unread notification count for an agent
 * @param {string} agentId - Agent ID
 * @returns {Object} - Unread count
 */
export const getUnreadNotificationCount = async (agentId) => {
  const count = await Notification.countDocuments({
    recipient: agentId,
    userRole: "agent",
    read: false,
  });

  return { unreadCount: count };
};

/**
 * Search notifications for an agent
 * @param {string} agentId - Agent ID
 * @param {Object} searchOptions - Search options
 * @returns {Array} - Filtered notifications
 */
export const searchAgentNotifications = async (agentId, searchOptions = {}) => {
  const { search = "", type = "", dateFrom = "", dateTo = "" } = searchOptions;

  let filters = {
    recipient: agentId,
    userRole: "agent",
  };

  if (search) {
    filters.$or = [
      { message: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
    ];
  }

  if (type && type !== "all") {
    filters.type = type;
  }

  if (dateFrom || dateTo) {
    filters.createdAt = {};
    if (dateFrom) {
      filters.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      filters.createdAt.$lte = new Date(dateTo);
    }
  }

  return await Notification.find(filters).sort({ createdAt: -1 }).lean();
};

/**
 * Create notification for agent
 * @param {string} agentId - Agent ID
 * @param {Object} notificationData - Notification data
 * @returns {Object} - Created notification
 */
export const createAgentNotification = async (agentId, notificationData) => {
  const { message, type, link = null } = notificationData;

  const notification = new Notification({
    recipient: agentId,
    userRole: "agent",
    message,
    type,
    link,
    read: false,
  });

  await notification.save();
  return notification.toObject();
};

/**
 * Delete notification
 * @param {string} agentId - Agent ID
 * @param {string} notificationId - Notification ID
 * @returns {Object} - Delete result
 */
export const deleteNotification = async (agentId, notificationId) => {
  const result = await Notification.deleteOne({
    _id: notificationId,
    recipient: agentId,
    userRole: "agent",
  });

  if (result.deletedCount === 0) {
    throw new Error("Notification not found");
  }

  return { message: "Notification deleted successfully" };
};

/**
 * Get notification types and counts for an agent
 * @param {string} agentId - Agent ID
 * @returns {Array} - Notification types with counts
 */
export const getNotificationTypesWithCounts = async (agentId) => {
  const pipeline = [
    {
      $match: {
        recipient: agentId,
        userRole: "agent",
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] },
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ];

  return await Notification.aggregate(pipeline);
};
