import { getAgentByUserId } from "../../services/agent/agentPropertyService.js";
import {
  getAgentNotifications as getNotificationsService,
  markNotificationAsRead as markAsReadService,
  markAllNotificationsAsRead as markAllAsReadService,
  getUnreadNotificationCount as getUnreadCountService,
  searchAgentNotifications as searchNotificationsService,
} from "../../services/agent/agentNotificationService.js";

/**
 * Get notifications for the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      read = null,
      type = "",
      search = "",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      read,
      type,
      search,
    };

    const result = await getNotificationsService(agent._id, options);

    res.status(200).json({
      status: true,
      data: result,
      message: "Agent notifications retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent notifications:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * Mark a notification as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Notification ID is required",
        error: "Missing notification ID",
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const updatedNotification = await markAsReadService(
      agent._id,
      notificationId
    );

    res.status(200).json({
      status: true,
      data: updatedNotification,
      message: "Notification marked as read successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    if (error.message === "Notification not found") {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Notification not found",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read for the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const result = await markAllAsReadService(agent._id);

    res.status(200).json({
      status: true,
      data: result,
      message: "All notifications marked as read successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

/**
 * Get unread notification count for the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const result = await getUnreadCountService(agent._id);

    res.status(200).json({
      status: true,
      data: result,
      message: "Unread notification count retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch unread notification count",
      error: error.message,
    });
  }
};

/**
 * Search notifications for the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchAgentNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Extract search parameters
    const { search = "", type = "", dateFrom = "", dateTo = "" } = req.query;

    const searchOptions = {
      search,
      type,
      dateFrom,
      dateTo,
    };

    const notifications = await searchNotificationsService(
      agent._id,
      searchOptions
    );

    res.status(200).json({
      status: true,
      data: notifications,
      message: "Notification search completed successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error searching agent notifications:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to search notifications",
      error: error.message,
    });
  }
};
