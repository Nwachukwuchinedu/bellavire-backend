/**
 * @swagger
 * tags:
 *   - name: Landlords
 *     description: Landlord management and operations
 */

/**
 * @swagger
 * /landlords/profile:
 *   get:
 *     summary: Get current landlord profile
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Landlord profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Landlord'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /landlords/profile:
 *   patch:
 *     summary: Update current landlord profile
 *     tags: [Landlords]
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
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Landlord profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Landlord'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: array
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/notification-settings:
 *   get:
 *     summary: Get landlord notification settings
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Notification settings object
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/notification-settings:
 *   patch:
 *     summary: Update landlord notification settings
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationSettings:
 *                 type: object
 *                 description: Notification settings to update
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Updated notification settings
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties:
 *   get:
 *     summary: Get all properties for the landlord with summary statistics
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
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
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/search-properties:
 *   get:
 *     summary: Search properties with filters
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for property name, location, address, or postcode
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
 *         description: Filter by availability date (YYYY-MM-DD)
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid filter parameters
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{id}:
 *   get:
 *     summary: Get a specific property by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - propertyName
 *               - propertyType
 *               - address
 *               - frontImage
 *               - bedrooms
 *               - bathrooms
 *               - monthlyRent
 *               - depositAmount
 *               - tenancy
 *               - availableFrom
 *               - paymentFrequency
 *               - addressLine1
 *               - cityOrTown
 *               - postalCode
 *               - regionOrCountry
 *             properties:
 *               propertyName:
 *                 type: string
 *               propertyType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [flat, shared, detached-house, semi-detached]
 *               address:
 *                 type: string
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               description:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               furnished:
 *                 type: boolean
 *               wifi:
 *                 type: boolean
 *               electricity:
 *                 type: boolean
 *               furnishedKitchen:
 *                 type: boolean
 *               water:
 *                 type: boolean
 *               gym:
 *                 type: boolean
 *               sharedAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [living room, bathroom, kitchen, dining room]
 *               billsIncluded:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [electricity, water, wifi]
 *               monthlyRent:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               tenancy:
 *                 type: string
 *                 enum: [monthly, annually]
 *               availableFrom:
 *                 type: string
 *                 format: date
 *               paymentFrequency:
 *                 type: string
 *                 enum: [monthly, weekly, annually]
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               cityOrTown:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               regionOrCountry:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error or file upload error
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{id}:
 *   patch:
 *     summary: Update a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               propertyName:
 *                 type: string
 *               propertyType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [flat, shared, detached-house, semi-detached]
 *               address:
 *                 type: string
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               description:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               furnished:
 *                 type: boolean
 *               wifi:
 *                 type: boolean
 *               electricity:
 *                 type: boolean
 *               furnishedKitchen:
 *                 type: boolean
 *               water:
 *                 type: boolean
 *               gym:
 *                 type: boolean
 *               sharedAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [living room, bathroom, kitchen, dining room]
 *               billsIncluded:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [electricity, water, wifi]
 *               monthlyRent:
 *                 type: number
 *               depositAmount:
 *                 type: number
 *               tenancy:
 *                 type: string
 *                 enum: [monthly, annually]
 *               availableFrom:
 *                 type: string
 *                 format: date
 *               paymentFrequency:
 *                 type: string
 *                 enum: [monthly, weekly, annually]
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               cityOrTown:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               regionOrCountry:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Property'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error or file upload error
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /landlords/properties/{propertyId}/rooms:
 *   get:
 *     summary: Get all rooms for a property
 *     tags: [Landlords]
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
 *         description: Property rooms retrieved successfully
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
 *                     property:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                     rooms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/rooms:
 *   post:
 *     summary: Add a new room to a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - floor
 *               - roomNumber
 *               - rent
 *             properties:
 *               floor:
 *                 type: string
 *                 description: Floor number
 *               roomNumber:
 *                 type: string
 *                 description: Room number
 *               rent:
 *                 type: number
 *                 description: Rent amount for this room
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *                 default: available
 *                 description: Room status
 *     responses:
 *       201:
 *         description: Room added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error or room already exists
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/rooms/{roomId}:
 *   get:
 *     summary: Get a specific room by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room retrieved successfully
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
 *                     room:
 *                       $ref: '#/components/schemas/Room'
 *                     property:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Room, property, or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/rooms/{roomId}:
 *   put:
 *     summary: Update a room
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               floor:
 *                 type: string
 *                 description: Floor number
 *               roomNumber:
 *                 type: string
 *                 description: Room number
 *               rent:
 *                 type: number
 *                 description: Rent amount for this room
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *                 description: Room status
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error or room already exists
 *       404:
 *         description: Room, property, or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/rooms/{roomId}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Cannot delete occupied room
 *       404:
 *         description: Room, property, or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/maintenances:
 *   get:
 *     summary: Get all maintenance requests for the landlord with summary statistics
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRequests:
 *                           type: integer
 *                         requestsInProgress:
 *                           type: integer
 *                         pendingRequests:
 *                           type: integer
 *                         completedRequests:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/maintenances/{id}:
 *   get:
 *     summary: Get a specific maintenance request by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Maintenance request retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Maintenance request or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/maintenances/{id}:
 *   patch:
 *     summary: Update maintenance request status
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 description: New status for the maintenance request
 *     responses:
 *       200:
 *         description: Maintenance request status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance request or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/maintenances/{id}/assign-contractor:
 *   post:
 *     summary: Assign a contractor to a maintenance request
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - name
 *               - email
 *               - phone
 *               - specialty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contractor's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contractor's email address
 *               phone:
 *                 type: string
 *                 description: Contractor's phone number
 *               specialty:
 *                 type: string
 *                 description: Contractor's area of specialty (e.g., plumbing, electrical, HVAC)
 *     responses:
 *       200:
 *         description: Contractor assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance request, contractor, or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/maintenances/{id}/remove-contractor:
 *   delete:
 *     summary: Remove contractor assignment from a maintenance request
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance request ID
 *     responses:
 *       200:
 *         description: Contractor removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Maintenance'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Maintenance request or landlord not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /landlords/leases:
 *   get:
 *     summary: Get all leases for the landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leases retrieved successfully
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
 *                     $ref: '#/components/schemas/Lease'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/leases/{id}:
 *   get:
 *     summary: Get a specific lease by ID with detailed information
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     responses:
 *       200:
 *         description: Lease retrieved successfully with detailed tenant, property, and payment information
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
 *                     _id:
 *                       type: string
 *                       description: Lease ID
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       description: Lease start date
 *                     expirationDate:
 *                       type: string
 *                       format: date-time
 *                       description: Lease expiration date
 *                     duration:
 *                       type: string
 *                       description: Duration of the lease
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *                       description: Status of the lease
 *                     currentProperty:
 *                       type: string
 *                       description: Current property name
 *                     streetName:
 *                       type: string
 *                       description: Street name of the property
 *                     rent:
 *                       type: number
 *                       description: Rent amount per month
 *                     apartment:
 *                       type: string
 *                       description: Apartment number or name
 *                     city:
 *                       type: string
 *                       description: City
 *                     zipCode:
 *                       type: string
 *                       description: Zip code
 *                     leaseDocument:
 *                       type: string
 *                       description: Lease document file path
 *                     isTerminated:
 *                       type: boolean
 *                       description: Whether the lease has been terminated
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     tenantDetail:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Tenant ID
 *                         firstName:
 *                           type: string
 *                           description: Tenant first name
 *                         lastName:
 *                           type: string
 *                           description: Tenant last name
 *                         email:
 *                           type: string
 *                           description: Tenant email
 *                         phoneNumber:
 *                           type: string
 *                           description: Tenant phone number
 *                         address:
 *                           type: string
 *                           description: Tenant address
 *                         country:
 *                           type: string
 *                           description: Tenant country
 *                         city:
 *                           type: string
 *                           description: Tenant city
 *                         employmentStatus:
 *                           type: string
 *                           description: Tenant employment status
 *                         monthlyIncome:
 *                           type: number
 *                           description: Tenant monthly income
 *                         paymentHistory:
 *                           type: array
 *                           description: Payment history for this tenant and property
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: Payment ID
 *                               description:
 *                                 type: string
 *                                 description: Payment description
 *                               amount:
 *                                 type: number
 *                                 description: Payment amount
 *                               dueDate:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Payment due date
 *                               transactionId:
 *                                 type: string
 *                                 description: Transaction ID
 *                               status:
 *                                 type: string
 *                                 enum: [paid, failed, outstanding, pending]
 *                                 description: Payment status
 *                               paymentMethod:
 *                                 type: string
 *                                 description: Payment method used
 *                               receipt:
 *                                 type: object
 *                                 description: Receipt details
 *                     propertyDetail:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Property ID
 *                         propertyName:
 *                           type: string
 *                           description: Property name
 *                         address:
 *                           type: string
 *                           description: Property address
 *                         monthlyRent:
 *                           type: number
 *                           description: Monthly rent amount
 *                         depositAmount:
 *                           type: number
 *                           description: Deposit amount
 *                         propertyType:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Property type
 *                         bedrooms:
 *                           type: number
 *                           description: Number of bedrooms
 *                         bathrooms:
 *                           type: number
 *                           description: Number of bathrooms
 *                     landlordDetail:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Landlord ID
 *                         firstName:
 *                           type: string
 *                           description: Landlord first name
 *                         lastName:
 *                           type: string
 *                           description: Landlord last name
 *                         email:
 *                           type: string
 *                           description: Landlord email
 *                         phoneNumber:
 *                           type: string
 *                           description: Landlord phone number
 *                         address:
 *                           type: string
 *                           description: Landlord address
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Lease or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/leases/{id}/terminate:
 *   patch:
 *     summary: Terminate a lease
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lease ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for termination
 *               comment:
 *                 type: string
 *                 description: Additional comments
 *     responses:
 *       200:
 *         description: Lease terminated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Lease'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Lease or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/tours:
 *   get:
 *     summary: Get landlord's tours
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, declined, cancelled, completed]
 *         description: Filter by tour status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tours from this date (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tours until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Tours retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /landlords/tours/calendar:
 *   get:
 *     summary: Get landlord calendar
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for calendar (YYYY-MM-DD). If not provided, defaults to first day of current month
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for calendar (YYYY-MM-DD). If not provided, defaults to last day of current month
 *     responses:
 *       200:
 *         description: Calendar data retrieved successfully
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
 *                     calendarData:
 *                       type: object
 *                       description: Tours grouped by date
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                         isDefault:
 *                           type: boolean
 *                           description: Whether default date range was used
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /landlords/tours/{tourId}:
 *   get:
 *     summary: Get tour by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Tour retrieved successfully
 *       404:
 *         description: Tour not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /landlords/tours/{tourId}/status:
 *   patch:
 *     summary: Update tour status
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
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
 *                 enum: [pending, confirmed, declined, cancelled, completed]
 *                 description: New status for the tour
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes
 *           example:
 *             status: "confirmed"
 *             notes: "Looking forward to showing you the property"
 *     responses:
 *       200:
 *         description: Tour status updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /landlords/tours/{tourId}/reschedule:
 *   patch:
 *     summary: Reschedule tour
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tour ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - timeSlot
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: New date for the tour (YYYY-MM-DD)
 *               timeSlot:
 *                 type: string
 *                 enum: [09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00]
 *                 description: New time slot for the tour
 *           example:
 *             date: "2024-07-16"
 *             timeSlot: "15:00"
 *     responses:
 *       200:
 *         description: Tour rescheduled successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /landlords/notifications:
 *   get:
 *     summary: Get all notifications for the landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/search-notifications:
 *   get:
 *     summary: Search and filter landlord notifications with multiple criteria
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: readStatus
 *         schema:
 *           type: string
 *           enum: [all, read, unread]
 *           default: all
 *         description: Filter by read status
 *       - in: query
 *         name: timeFilter
 *         schema:
 *           type: string
 *           enum: [all, today, yesterday, 3 days ago, 1 week ago]
 *           default: all
 *         description: Filter by time period
 *       - in: query
 *         name: typeFilter
 *         schema:
 *           type: string
 *           enum: [all, maintenance, message, payment, document, system update]
 *           default: all
 *         description: Filter by notification type
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
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: Filtered notifications retrieved successfully
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
 *                     total:
 *                       type: integer
 *                       description: Total number of notifications matching filters
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     pageSize:
 *                       type: integer
 *                       description: Number of notifications per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     filters:
 *                       type: object
 *                       properties:
 *                         readStatus:
 *                           type: string
 *                           description: Applied read status filter
 *                         timeFilter:
 *                           type: string
 *                           description: Applied time filter
 *                         typeFilter:
 *                           type: string
 *                           description: Applied type filter
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/notifications/{id}:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Notification or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read for the landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications for the landlord
 *     tags: [Landlords]
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
 *                   type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/tenant-applications:
 *   get:
 *     summary: Get all rental applications for the landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, cancelled]
 *           default: all
 *         description: Filter by application status
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
 *         description: Number of applications per page
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TenantApplication'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         approved:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/tenant-applications/{applicationId}:
 *   get:
 *     summary: Get a specific application by ID
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TenantApplication'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Application or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/tenant-applications/{applicationId}/respond:
 *   patch:
 *     summary: Approve or cancel an application
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - decision
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [approved, cancelled]
 *                 description: Landlord's decision
 *           example:
 *             decision: "approved"
 *     responses:
 *       200:
 *         description: Application responded to successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TenantApplication'
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Invalid decision or application already processed
 *       404:
 *         description: Application or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/tenant-applications:
 *   get:
 *     summary: Get all applications for a specific property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, pending, approved, cancelled]
 *           default: all
 *         description: Filter by application status
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
 *         description: Number of applications per page
 *     responses:
 *       200:
 *         description: Property applications retrieved successfully
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
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TenantApplication'
 *                     property:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property or landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/lease-document:
 *   post:
 *     summary: Upload lease document for landlord
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - leaseDocument
 *             properties:
 *               leaseDocument:
 *                 type: string
 *                 format: binary
 *                 description: Lease document file (PDF, DOC, DOCX)
 *     responses:
 *       200:
 *         description: Lease document uploaded successfully
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
 *                     documentPath:
 *                       type: string
 *                     documentUrl:
 *                       type: string
 *                     message:
 *                       type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: No document uploaded
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/agents:
 *   get:
 *     summary: Get all available agents for property assignment
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available agents retrieved successfully
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
 *                     agents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *                           company:
 *                             type: string
 *                           description:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Landlord not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/assign-agent:
 *   post:
 *     summary: Assign an agent to a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID to assign agent to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *             properties:
 *               agentId:
 *                 type: string
 *                 description: ID of the agent to assign to the property
 *     responses:
 *       200:
 *         description: Agent assigned to property successfully
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
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *                     assignedAgent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         company:
 *                           type: string
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       400:
 *         description: Agent ID is required
 *       404:
 *         description: Property not found, Landlord not found, or Agent not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /landlords/properties/{propertyId}/remove-agent:
 *   delete:
 *     summary: Remove agent from a property
 *     tags: [Landlords]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID to remove agent from
 *     responses:
 *       200:
 *         description: Agent removed from property successfully
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
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *                     removedAgent:
 *                       type: string
 *                       description: ID of the removed agent
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       404:
 *         description: Property not found or Landlord not found
 *       500:
 *         description: Server error
 */

export default {};
