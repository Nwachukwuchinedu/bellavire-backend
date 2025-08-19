import Landlord from "../../models/Landlord.js";
import Notification from "../../models/Notification.js";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "../../services/notificationService.js";

/**
 * Get all notifications for the current landlord
 */
export const getLandlordNotifications = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const { page, limit, filter } = req.query;
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      filter: filter || "all",
    };

    const result = await getNotifications(landlord._id, "landlord", options);

    res.json({
      status: true,
      data: result,
      message: "Notifications retrieved successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve notifications",
      error: err.message,
    });
  }
};

/**
 * Mark a specific notification as read for the current landlord
 */
export const markLandlordNotificationAsReadById = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const notification = await markNotificationAsRead(
      req.params.id,
      landlord._id,
      "landlord"
    );

    res.json({
      status: true,
      data: notification,
      message: "Notification marked as read successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to mark notification as read",
      error: err.message,
    });
  }
};

/**
 * Mark all notifications as read for the current landlord
 */
export const markAllLandlordNotificationsAsRead = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const result = await markAllNotificationsAsRead(landlord._id, "landlord");

    res.json({
      status: true,
      data: { modifiedCount: result.modifiedCount },
      message: "All notifications marked as read successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to mark notifications as read",
      error: err.message,
    });
  }
};

/**
 * Get unread notification count for the current landlord
 */
export const getUnreadLandlordNotificationCount = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const unreadCount = await getUnreadNotificationCount(
      landlord._id,
      "landlord"
    );

    res.json({
      status: true,
      data: { unreadCount },
      message: "Unread count retrieved successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to get unread count",
      error: err.message,
    });
  }
};

/**
 * Search notifications for the current landlord with multiple filters
 */
export const searchLandlordNotifications = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const {
      readStatus = "all",
      timeFilter = "all",
      typeFilter = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = { recipient: landlord._id, userRole: "landlord" };

    // Read status filter
    if (readStatus === "read") {
      query.read = true;
    } else if (readStatus === "unread") {
      query.read = false;
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      let startDate;

      switch (timeFilter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "yesterday":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
          );
          break;
        case "3 days ago":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 3
          );
          break;
        case "1 week ago":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 7
          );
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      const typeMapping = {
        maintenance: [
          "maintenance_new_request",
          "maintenance_status_updated",
          "maintenance_resolved",
        ],
        message: [
          "tour_request",
          "tour_cancelled",
          "tour_rescheduled",
          "chat_message",
        ],
        payment: ["payment_successful", "payment_failed", "payment_pending"],
        document: [
          "document_uploaded",
          "document_approved",
          "document_rejected",
        ],
        "system update": ["system_update", "system_maintenance"],
      };

      if (typeMapping[typeFilter]) {
        query.type = { $in: typeMapping[typeFilter] };
      }
    }

    // Get notifications and total count
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: true,
      data: {
        notifications,
        total,
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalPages,
        filters: {
          readStatus,
          timeFilter,
          typeFilter,
        },
      },
      message: "Notifications retrieved successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve notifications",
      error: err.message,
    });
  }
};
