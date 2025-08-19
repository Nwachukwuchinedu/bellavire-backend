import express from "express";
import {
  authenticateToken,
  requireLandlord,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getCurrentLandlord,
  updateLandlord,
  getNotificationSettings,
  updateNotificationSettings,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenanceStatus,
  assignContractor,
  removeContractor,
  getAllLeases,
  getLeaseById,
  terminateLease,
  // Lease document controllers
  uploadLeaseDocument,
  // Tour controllers
  getMyTours,
  getTourById,
  updateTourStatus,
  rescheduleTour,
  getTourCalendar,
  // Notification controllers
  getLandlordNotifications,
  markLandlordNotificationAsReadById,
  markAllLandlordNotificationsAsRead,
  getUnreadLandlordNotificationCount,
  searchLandlordNotifications,
  // Application controllers
  getAllApplications,
  getApplicationById,
  respondToApplication,
  getPropertyApplications,
  // Room management controllers
  getPropertyRooms,
  addRoomToProperty,
  updateRoom,
  deleteRoom,
  getRoomById,
} from "../controllers/landlordController.js";

const landlordRouter = express.Router();

// Profile routes
landlordRouter.get(
  "/profile",
  authenticateToken,
  requireLandlord,
  getCurrentLandlord
);
landlordRouter.patch(
  "/profile",
  authenticateToken,
  requireLandlord,
  updateLandlord
);

// Notification settings routes
landlordRouter.get(
  "/notification-settings",
  authenticateToken,
  requireLandlord,
  getNotificationSettings
);
landlordRouter.patch(
  "/notification-settings",
  authenticateToken,
  requireLandlord,
  updateNotificationSettings
);

// Property routes
landlordRouter.get(
  "/properties",
  authenticateToken,
  requireLandlord,
  getAllProperties
);
landlordRouter.get(
  "/search-properties",
  authenticateToken,
  requireLandlord,
  searchProperties
);
landlordRouter.get(
  "/properties/:id",
  authenticateToken,
  requireLandlord,
  getPropertyById
);
landlordRouter.post(
  "/properties",
  authenticateToken,
  requireLandlord,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "propertyImages", maxCount: 10 },
  ]),
  createProperty
);
landlordRouter.patch(
  "/properties/:id",
  authenticateToken,
  requireLandlord,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "propertyImages", maxCount: 10 },
  ]),
  updateProperty
);
landlordRouter.delete(
  "/properties/:id",
  authenticateToken,
  requireLandlord,
  deleteProperty
);

// Room management routes
landlordRouter.get(
  "/properties/:propertyId/rooms",
  authenticateToken,
  requireLandlord,
  getPropertyRooms
);
landlordRouter.post(
  "/properties/:propertyId/rooms",
  authenticateToken,
  requireLandlord,
  addRoomToProperty
);
landlordRouter.get(
  "/properties/:propertyId/rooms/:roomId",
  authenticateToken,
  requireLandlord,
  getRoomById
);
landlordRouter.put(
  "/properties/:propertyId/rooms/:roomId",
  authenticateToken,
  requireLandlord,
  updateRoom
);
landlordRouter.delete(
  "/properties/:propertyId/rooms/:roomId",
  authenticateToken,
  requireLandlord,
  deleteRoom
);

// Maintenance routes
landlordRouter.get(
  "/maintenances",
  authenticateToken,
  requireLandlord,
  getAllMaintenances
);
landlordRouter.get(
  "/maintenances/:id",
  authenticateToken,
  requireLandlord,
  getMaintenanceById
);
landlordRouter.patch(
  "/maintenances/:id",
  authenticateToken,
  requireLandlord,
  updateMaintenanceStatus
);
landlordRouter.post(
  "/maintenances/:id/assign-contractor",
  authenticateToken,
  requireLandlord,
  assignContractor
);
landlordRouter.delete(
  "/maintenances/:id/remove-contractor",
  authenticateToken,
  requireLandlord,
  removeContractor
);

// Lease routes
landlordRouter.get("/leases", authenticateToken, requireLandlord, getAllLeases);
landlordRouter.get(
  "/leases/:id",
  authenticateToken,
  requireLandlord,
  getLeaseById
);
landlordRouter.patch(
  "/leases/:id/terminate",
  authenticateToken,
  requireLandlord,
  terminateLease
);

// Tour routes
landlordRouter.get("/tours", authenticateToken, requireLandlord, getMyTours);
landlordRouter.get(
  "/tours/calendar",
  authenticateToken,
  requireLandlord,
  getTourCalendar
);
landlordRouter.get(
  "/tours/:tourId",
  authenticateToken,
  requireLandlord,
  getTourById
);
landlordRouter.patch(
  "/tours/:tourId/status",
  authenticateToken,
  requireLandlord,
  updateTourStatus
);
landlordRouter.patch(
  "/tours/:tourId/reschedule",
  authenticateToken,
  requireLandlord,
  rescheduleTour
);

// Notification routes
landlordRouter.get(
  "/notifications",
  authenticateToken,
  requireLandlord,
  getLandlordNotifications
);
landlordRouter.get(
  "/search-notifications",
  authenticateToken,
  requireLandlord,
  searchLandlordNotifications
);
landlordRouter.patch(
  "/notifications/:id/read",
  authenticateToken,
  requireLandlord,
  markLandlordNotificationAsReadById
);
landlordRouter.patch(
  "/notifications/mark-all-read",
  authenticateToken,
  requireLandlord,
  markAllLandlordNotificationsAsRead
);
landlordRouter.get(
  "/notifications/unread-count",
  authenticateToken,
  requireLandlord,
  getUnreadLandlordNotificationCount
);

// Application routes
landlordRouter.get(
  "/tenant-applications",
  authenticateToken,
  requireLandlord,
  getAllApplications
);
landlordRouter.get(
  "/tenant-applications/:applicationId",
  authenticateToken,
  requireLandlord,
  getApplicationById
);
landlordRouter.patch(
  "/tenant-applications/:applicationId/respond",
  authenticateToken,
  requireLandlord,
  respondToApplication
);
landlordRouter.get(
  "/properties/:propertyId/tenant-applications",
  authenticateToken,
  requireLandlord,
  getPropertyApplications
);

// Document routes
landlordRouter.post(
  "/lease-document",
  authenticateToken,
  requireLandlord,
  upload.single("leaseDocument"),
  uploadLeaseDocument
);

export default landlordRouter;
