// Property management
export {
  getAgentProperties,
  getAgentPropertyById,
  searchAgentProperties,
} from "./agentPropertyController.js";

// Maintenance management
export {
  getAgentMaintenanceRequests,
  getAgentMaintenanceById,
  updateMaintenanceStatus,
  assignContractorToMaintenance,
  removeContractorFromMaintenance,
  getAvailableContractors,
  addContractor,
} from "./agentMaintenanceController.js";

// Task management
export {
  getAgentTaskOverview,
  getAgentTasks,
  getAgentDashboardStats,
} from "./agentTaskController.js";

// Notification management
export {
  getAgentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  searchAgentNotifications,
} from "./agentNotificationController.js";

// Profile management
export { getCurrentAgent, updateAgent } from "./agentProfileController.js";

// Tenant management
export {
  getAgentTenants,
  getAgentTenantById,
} from "./agentTenantController.js";

// Settings management
export {
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
} from "./agentSettingsController.js";
