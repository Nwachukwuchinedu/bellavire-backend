/**
 * @swagger
 * tags:
 *   - name: Agents
 *     description: Agent management and operations
 */

/**
 * @swagger
 * /agents/profile:
 *   get:
 *     summary: Get current agent profile
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Agent profile not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/profile:
 *   patch:
 *     summary: Update current agent profile
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               address:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               profileImage:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agent profile updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Agent not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/dashboard/stats:
 *   get:
 *     summary: Get comprehensive dashboard statistics for agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskOverview:
 *                       type: object
 *                       properties:
 *                         totalTasks:
 *                           type: integer
 *                         highPriorityTasks:
 *                           type: integer
 *                         mediumPriorityTasks:
 *                           type: integer
 *                         lowPriorityTasks:
 *                           type: integer
 *                         overdueTasks:
 *                           type: integer
 *                         completedTasks:
 *                           type: integer
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                     performanceMetrics:
 *                       type: object
 *                       properties:
 *                         maintenanceResolutionRate:
 *                           type: number
 *                         averageResponseTime:
 *                           type: number
 *                     assignedProperties:
 *                       type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/properties:
 *   get:
 *     summary: Get all properties assigned to the agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for property name, address
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by property status
 *       - in: query
 *         name: cityOrTown
 *         schema:
 *           type: string
 *         description: Filter by city or town
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         count:
 *                           type: integer
 *                         perPage:
 *                           type: integer
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalProperties:
 *                           type: integer
 *                         totalRooms:
 *                           type: integer
 *                         occupiedRooms:
 *                           type: integer
 *                         vacantRooms:
 *                           type: integer
 *                         totalMonthlyRent:
 *                           type: number
 *                         averageMonthlyRent:
 *                           type: number
 *                         occupancyRate:
 *                           type: number
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/properties/search:
 *   get:
 *     summary: Search properties with advanced filters
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: minRent
 *         schema:
 *           type: number
 *         description: Minimum rent amount
 *       - in: query
 *         name: maxRent
 *         schema:
 *           type: number
 *         description: Maximum rent amount
 *       - in: query
 *         name: occupation
 *         schema:
 *           type: string
 *           enum: [occupied, vacant, all]
 *         description: Filter by occupation status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by availability date
 *     responses:
 *       200:
 *         description: Properties search completed successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/properties/{propertyId}:
 *   get:
 *     summary: Get specific property by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *       404:
 *         description: Property not found or not assigned to agent
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/tenants:
 *   get:
 *     summary: Get all tenants in agent's assigned properties
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for tenant name, email, phone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filter by tenant status
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by specific property
 *     responses:
 *       200:
 *         description: Tenants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tenant'
 *                     pagination:
 *                       type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalTenants:
 *                           type: integer
 *                         activeTenants:
 *                           type: integer
 *                         inactiveTenants:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/tenants/{tenantId}:
 *   get:
 *     summary: Get specific tenant by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tenant ID
 *     responses:
 *       200:
 *         description: Tenant retrieved successfully
 *       404:
 *         description: Tenant not found or not in agent's properties
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/maintenance:
 *   get:
 *     summary: Get all maintenance requests for agent's properties
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in progress, resolved, failed, all]
 *         description: Filter by maintenance status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for issue, description, tenant name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by maintenance category
 *     responses:
 *       200:
 *         description: Maintenance requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     maintenances:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Maintenance'
 *                     pagination:
 *                       type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: integer
 *                         pendingRequests:
 *                           type: integer
 *                         inProgressRequests:
 *                           type: integer
 *                         completedRequests:
 *                           type: integer
 *                         failedRequests:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/maintenance/{maintenanceId}:
 *   get:
 *     summary: Get specific maintenance request by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Maintenance request retrieved successfully
 *       404:
 *         description: Maintenance request not found or not assigned to agent
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/maintenance/{maintenanceId}/status:
 *   patch:
 *     summary: Update maintenance request status
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, in progress, pending, failed]
 *                 description: New status for maintenance request
 *     responses:
 *       200:
 *         description: Maintenance status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance request not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/maintenance/{maintenanceId}/assign-contractor:
 *   post:
 *     summary: Assign contractor to maintenance request
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractorId
 *             properties:
 *               contractorId:
 *                 type: string
 *                 description: Contractor ID to assign
 *     responses:
 *       200:
 *         description: Contractor assigned successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance request or contractor not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/maintenance/{maintenanceId}/remove-contractor:
 *   delete:
 *     summary: Remove contractor from maintenance request
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: maintenanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Contractor removed successfully
 *       404:
 *         description: Maintenance request not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/contractors:
 *   get:
 *     summary: Get all available contractors
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by contractor specialty
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, busy, unavailable, all]
 *           default: available
 *         description: Filter by availability status
 *     responses:
 *       200:
 *         description: Contractors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contractor'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/contractors:
 *   post:
 *     summary: Add new contractor
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - email
 *               - specialty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contractor full name
 *               phone:
 *                 type: string
 *                 description: Contractor phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contractor email address
 *               specialty:
 *                 type: string
 *                 description: Contractor area of specialty
 *               availability:
 *                 type: string
 *                 enum: [available, busy, unavailable]
 *                 default: available
 *                 description: Contractor availability status
 *     responses:
 *       201:
 *         description: Contractor added successfully
 *       400:
 *         description: Validation error or contractor already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/tasks/overview:
 *   get:
 *     summary: Get task overview for agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTasks:
 *                       type: integer
 *                     highPriorityTasks:
 *                       type: integer
 *                     mediumPriorityTasks:
 *                       type: integer
 *                     lowPriorityTasks:
 *                       type: integer
 *                     overdueTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     tasksByCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total:
 *                             type: integer
 *                           tasks:
 *                             type: array
 *                     recentTasks:
 *                       type: array
 *                     upcomingDeadlines:
 *                       type: array
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/tasks:
 *   get:
 *     summary: Get detailed tasks for agent with filtering
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [maintenance, applications, tours, all]
 *           default: all
 *         description: Filter by task category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low, all]
 *           default: all
 *         description: Filter by task priority
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: all
 *         description: Filter by task status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for tasks
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/notifications:
 *   get:
 *     summary: Get notifications for agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/notifications/search:
 *   get:
 *     summary: Search notifications for agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Notification search completed successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read for agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /agents/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count for agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 */
