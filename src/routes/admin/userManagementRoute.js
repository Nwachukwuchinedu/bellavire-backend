import express from 'express';
import { getUsers, getTenant, getLandlord, getAgent, editUserProfile } from '../../controllers/admin/userManagementController.js';
import { authenticateAdminToken } from '../../middleware/adminAuthMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get a paginated, searchable, and filterable list of users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by first name, last name, or email (case-insensitive)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [agent, landlord, tenant]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by user status (Active/Inactive)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created after this date (inclusive)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created before this date (inclusive)
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, landlord, tenant]
 *                       phoneNumber:
 *                         type: string
 *                       dateJoined:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [Active, Inactive]
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
// GET /admin/users - paginated, searchable, filterable user list
router.get('/', authenticateAdminToken, getUsers);

/**
 * @swagger
 * /admin/users/tenants/{tenantId}/properties/{propertyId}:
 *   get:
 *     summary: Get a specific tenant by ID with specific property details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Tenant and property details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     image:
 *                       type: string
 *                     name:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     dateJoined:
 *                       type: string
 *                       format: date-time
 *                     employmentStatus:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                     propertyDetails:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         expirationDate:
 *                           type: string
 *                           format: date
 *                         duration:
 *                           type: string
 *                           example: "12 months"
 *                         propertyName:
 *                           type: string
 *                         address:
 *                           type: string
 *                         rent:
 *                           type: number
 *                           example: 850
 *                         city:
 *                           type: string
 *                         zipCode:
 *                           type: string
 *                 message:
 *                   type: string
 *                   example: "Tenant and property details retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Tenant or property not found
 *       500:
 *         description: Server error
 */
router.get('/tenants/:tenantId/properties/:propertyId', authenticateAdminToken, getTenant);

/**
 * @swagger
 * /admin/users/landlords/{id}:
 *   get:
 *     summary: Get a specific landlord by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Landlord ID
 *     responses:
 *       200:
 *         description: Landlord details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     image:
 *                       type: string
 *                     name:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     dateJoined:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                     description:
 *                       type: string
 *                     proofOfGovernmentIssuedId:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Landlord retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */
router.get('/landlords/:id', authenticateAdminToken, getLandlord);

/**
 * @swagger
 * /admin/users/agents/{id}:
 *   get:
 *     summary: Get a specific agent by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     image:
 *                       type: string
 *                     name:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *                     gender:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     dateJoined:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [Active, Inactive]
 *                     description:
 *                       type: string
 *                     proofOfGovernmentIssuedId:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Agent retrieved successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */
router.get('/agents/:id', authenticateAdminToken, getAgent);

/**
 * @swagger
 * /admin/users/{userId}/profile:
 *   put:
 *     summary: Edit user profile (tenant, landlord, or agent)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - gender
 *               - address
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer_not_to_say]
 *                 description: User's gender
 *                 example: "male"
 *               address:
 *                 type: string
 *                 description: User's address
 *                 example: "123 Main St, City, Country"
 *               governmentIssuedId:
 *                 type: string
 *                 description: Government issued ID (required for landlords and agents, optional for tenants)
 *                 example: "ID123456789"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID
 *                     firstName:
 *                       type: string
 *                       description: Updated first name
 *                     lastName:
 *                       type: string
 *                       description: Updated last name
 *                     email:
 *                       type: string
 *                       description: Updated email
 *                     phoneNumber:
 *                       type: string
 *                       description: Updated phone number
 *                     gender:
 *                       type: string
 *                       description: Updated gender
 *                     role:
 *                       type: string
 *                       description: User role
 *                     address:
 *                       type: string
 *                       description: Updated address
 *                     governmentIssuedId:
 *                       type: string
 *                       description: Updated government issued ID
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Bad request - validation error or business logic error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email is already taken by another user"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:userId/profile', authenticateAdminToken, editUserProfile);

export default router;
