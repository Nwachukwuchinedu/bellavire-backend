// Profile and notification settings
export {
  getCurrentLandlord,
  updateLandlord,
  getNotificationSettings,
  updateNotificationSettings,
} from "./landlordProfileController.js";

// Property management
export {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getPropertyRooms,
  addRoomToProperty,
  updateRoom,
  deleteRoom,
  getRoomById,
  assignAgentToProperty,
  removeAgentFromProperty,
  getAvailableAgents,
} from "./landlordPropertyController.js";

// Maintenance management
export {
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenanceStatus,
  assignContractor,
  removeContractor,
} from "./landlordMaintenanceController.js";

// Lease management
export {
  getAllLeases,
  getLeaseById,
  terminateLease,
} from "./landlordLeaseController.js";

// Tour management
export {
  getMyTours,
  getTourById,
  updateTourStatus,
  rescheduleTour,
  getTourCalendar,
} from "./landlordTourController.js";

// Notification management
export {
  getLandlordNotifications,
  markLandlordNotificationAsReadById,
  markAllLandlordNotificationsAsRead,
  getUnreadLandlordNotificationCount,
  searchLandlordNotifications,
} from "./landlordNotificationController.js";

// Application management
export {
  getAllApplications,
  getApplicationById,
  respondToApplication,
  getPropertyApplications,
} from "./landlordApplicationController.js";

// Document management
export { uploadLeaseDocument } from "./landlordDocumentController.js";
