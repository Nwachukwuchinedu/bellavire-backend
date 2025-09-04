import express from "express";
import {
  authenticateToken,
  requireAgent,
} from "../middleware/authMiddleware.js";
import {
  // Profile management
  getCurrentAgent,
  updateAgent,

  // Property management
  getAgentProperties,
  getAgentPropertyById,
  searchAgentProperties,

  // Tenant management
  getAgentTenants,
  getAgentTenantById,

  // Maintenance management
  getAgentMaintenanceRequests,
  getAgentMaintenanceById,
  updateMaintenanceStatus,
  assignContractorToMaintenance,
  removeContractorFromMaintenance,
  getAvailableContractors,
  addContractor,

  // Task management
  getAgentTaskOverview,
  getAgentTasks,
  getAgentDashboardStats,

  // Notification management
  getAgentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  searchAgentNotifications,

  // Settings management
  getAllSettings,
  getAccountSettings,
  updateAccountSettings,
  updatePassword,
  updateTwoFactorAuth,
  updateSecuritySettings,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/agent/index.js";

const agentRouter = express.Router();

// Profile routes
agentRouter.get("/profile", authenticateToken, requireAgent, getCurrentAgent);
agentRouter.patch("/profile", authenticateToken, requireAgent, updateAgent);

// Dashboard routes
agentRouter.get(
  "/dashboard/stats",
  authenticateToken,
  requireAgent,
  getAgentDashboardStats
);

// Property routes
agentRouter.get(
  "/properties",
  authenticateToken,
  requireAgent,
  getAgentProperties
);
agentRouter.get(
  "/properties/search",
  authenticateToken,
  requireAgent,
  searchAgentProperties
);
agentRouter.get(
  "/properties/:propertyId",
  authenticateToken,
  requireAgent,
  getAgentPropertyById
);

// Tenant routes
agentRouter.get("/tenants", authenticateToken, requireAgent, getAgentTenants);
agentRouter.get(
  "/tenants/:tenantId",
  authenticateToken,
  requireAgent,
  getAgentTenantById
);

// Maintenance routes
agentRouter.get(
  "/maintenance",
  authenticateToken,
  requireAgent,
  getAgentMaintenanceRequests
);
agentRouter.get(
  "/maintenance/:maintenanceId",
  authenticateToken,
  requireAgent,
  getAgentMaintenanceById
);
agentRouter.patch(
  "/maintenance/:maintenanceId/status",
  authenticateToken,
  requireAgent,
  updateMaintenanceStatus
);
agentRouter.post(
  "/maintenance/:maintenanceId/assign-contractor",
  authenticateToken,
  requireAgent,
  assignContractorToMaintenance
);
agentRouter.delete(
  "/maintenance/:maintenanceId/remove-contractor",
  authenticateToken,
  requireAgent,
  removeContractorFromMaintenance
);

// Contractor routes
agentRouter.get(
  "/contractors",
  authenticateToken,
  requireAgent,
  getAvailableContractors
);
agentRouter.post(
  "/contractors",
  authenticateToken,
  requireAgent,
  addContractor
);

// Task management routes
agentRouter.get(
  "/tasks/overview",
  authenticateToken,
  requireAgent,
  getAgentTaskOverview
);
agentRouter.get("/tasks", authenticateToken, requireAgent, getAgentTasks);

// Notification routes
agentRouter.get(
  "/notifications",
  authenticateToken,
  requireAgent,
  getAgentNotifications
);
agentRouter.get(
  "/notifications/search",
  authenticateToken,
  requireAgent,
  searchAgentNotifications
);
agentRouter.patch(
  "/notifications/:notificationId/read",
  authenticateToken,
  requireAgent,
  markNotificationAsRead
);
agentRouter.patch(
  "/notifications/mark-all-read",
  authenticateToken,
  requireAgent,
  markAllNotificationsAsRead
);
agentRouter.get(
  "/notifications/unread-count",
  authenticateToken,
  requireAgent,
  getUnreadNotificationCount
);

// ===== COMPREHENSIVE SETTINGS ROUTES =====

// Get all settings
agentRouter.get(
  "/settings",
  authenticateToken,
  requireAgent,
  getAllSettings
);

// Account settings routes
agentRouter.get(
  "/settings/account",
  authenticateToken,
  requireAgent,
  getAccountSettings
);
agentRouter.patch(
  "/settings/account",
  authenticateToken,
  requireAgent,
  updateAccountSettings
);

// Security settings routes
agentRouter.patch(
  "/settings/security/password",
  authenticateToken,
  requireAgent,
  updatePassword
);
agentRouter.patch(
  "/settings/security/two-factor",
  authenticateToken,
  requireAgent,
  updateTwoFactorAuth
);
agentRouter.patch(
  "/settings/security",
  authenticateToken,
  requireAgent,
  updateSecuritySettings
);

// Notification settings routes
agentRouter.get(
  "/notification-settings",
  authenticateToken,
  requireAgent,
  getNotificationSettings
);
agentRouter.patch(
  "/notification-settings",
  authenticateToken,
  requireAgent,
  updateNotificationSettings
);

// Notification preferences routes
agentRouter.get(
  "/settings/notification-preferences",
  authenticateToken,
  requireAgent,
  getNotificationPreferences
);
agentRouter.patch(
  "/settings/notification-preferences",
  authenticateToken,
  requireAgent,
  updateNotificationPreferences
);

export default agentRouter;
