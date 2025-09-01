/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user management
 *   - name: Tenants
 *     description: Tenant management and operations
 *   - name: Landlords
 *     description: Landlord management and operations
 *   - name: Agents
 *     description: Agent management and operations
 *   - name: Admin
 *     description: Admin management and operations
 *   - name: Direct Chat
 *     description: Real-time chat between landlords, tenants, and agents
 */
import express from "express";
import authRoutes from "./auth/authRoute.js";
import propertyRoutes from "./propertyRoute.js";
import newsLetterRoutes from "./newsLetterRoute.js";
import tenantRoutes from "./tenantRoutes.js";
import landlordRoutes from "./landlordRoutes.js";
import agentRoutes from "./agentRoutes.js";
import contactUsRoute from "./contactUsRoute.js";
import adminRoutes from "./admin/admin.js";
import directChatRoutes from "./directChatRoute.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/public", propertyRoutes);
router.use("/", newsLetterRoutes);
router.use("/tenants", tenantRoutes);
router.use("/landlords", landlordRoutes);
router.use("/agents", agentRoutes);
router.use("/", contactUsRoute);
router.use("/admin", adminRoutes);
router.use("/direct-chat", directChatRoutes); // Real-time chat between users

export default router;
