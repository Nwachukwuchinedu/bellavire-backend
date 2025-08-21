import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Agent from '../../models/Agent.js';
import Lease from '../../models/Lease.js';
import Property from '../../models/Property.js';

/**
 * Get paginated users with search and filter
 * @param {Object} params - { page, limit, search, role, status, dateFrom, dateTo }
 * @returns {Object} - { total, page, limit, totalPages, users }
 */
export const getPaginatedUsers = async ({ page = 1, limit = 10, search, role, status, dateFrom, dateTo }) => {
    const skip = (page - 1) * limit;
    const query = {};

    // Search by name or email - optimized for case-insensitive search
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by role
    if (role) {
        query.role = role;
    }

    // Filter by status (active/inactive)
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    // Filter by date joined - optimized date range query
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
            // Add one day to include the end date
            const endDate = new Date(dateTo);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt.$lt = endDate;
        }
    }

    // Use Promise.all to run count and find operations in parallel
    const [total, users] = await Promise.all([
        User.countDocuments(query).hint({ createdAt: -1 }), // Use index hint
        User.find(query, {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            phoneNumber: 1,
            createdAt: 1,
            isActive: 1,
            profileImage: 1,
            dateOfBirth: 1,
            gender: 1
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean() // Use lean() for better performance
            .hint({ createdAt: -1 }) // Use index hint
    ]);

    // Map status to Active/Inactive
    const mappedUsers = users.map(u => ({
        ...u,
        status: u.isActive ? 'Active' : 'Inactive',
        dateJoined: u.createdAt
    }));

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        users: mappedUsers
    };
};

/**
 * Get tenant by ID with specific property details
 * @param {string} tenantId - Tenant ID
 * @param {string} propertyId - Property ID
 * @returns {Object} - Tenant object with specific property details
 */
export const getTenantByIdAndPropertyById = async (tenantId, propertyId) => {
    const tenant = await Tenant.findById(tenantId)
        .populate('user', 'firstName lastName email phoneNumber profileImage dateOfBirth gender isActive createdAt')
        .lean();

    if (!tenant) {
        throw new Error('Tenant not found');
    }

    // Find specific property by ID that is associated with this tenant
    const property = await Property.findOne({
        _id: propertyId,
        tenant: tenantId
    }).lean();

    if (!property) {
        throw new Error('Property not found for this tenant');
    }

    const tenantStatus = tenant.user?.isActive !== undefined ? tenant.user.isActive : true;

    // Calculate lease duration
    const startDate = property.availableFrom;
    const expirationDate = new Date(startDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Default 1 year lease

    const durationInMonths = 12; // Default duration
    const durationText = `${durationInMonths} months`;

    const propertyDetails = {
        startDate: startDate,
        expirationDate: expirationDate,
        duration: durationText,
        propertyName: property.propertyName,
        address: property.address,
        rent: property.monthlyRent,
        city: property.cityOrTown,
        zipCode: property.postalCode
    };

    return {
        id: tenant._id,
        image: tenant.user?.profileImage || tenant.profileImage,
        name: `${tenant.user?.firstName || tenant.firstName} ${tenant.user?.lastName || tenant.lastName}`,
        dateOfBirth: tenant.user?.dateOfBirth || tenant.dateOfBirth,
        gender: tenant.user?.gender || tenant.gender,
        email: tenant.user?.email || tenant.email,
        phoneNumber: tenant.user?.phoneNumber || tenant.phoneNumber,
        dateJoined: tenant.user?.createdAt || tenant.createdAt,
        employmentStatus: tenant.employmentInfo?.employmentStatus,
        status: tenantStatus ? 'Active' : 'Inactive',
        propertyDetails: propertyDetails
    };
};

/**
 * Get landlord by ID with details
 * @param {string} id - Landlord ID
 * @returns {Object} - Landlord object with details
 */
export const getLandlordById = async (id) => {
    const landlord = await Landlord.findById(id)
        .populate('user', 'firstName lastName email phoneNumber profileImage dateOfBirth gender isActive createdAt')
        .lean();

    if (!landlord) {
        throw new Error('Landlord not found');
    }

    const landlordStatus = landlord.user?.isActive !== undefined ? landlord.user.isActive : true;

    return {
        id: landlord._id,
        image: landlord.user?.profileImage || landlord.profileImage,
        name: `${landlord.user?.firstName || landlord.firstName} ${landlord.user?.lastName || landlord.lastName}`,
        dateOfBirth: landlord.user?.dateOfBirth || landlord.dateOfBirth,
        gender: landlord.user?.gender || landlord.gender,
        email: landlord.user?.email || landlord.email,
        phoneNumber: landlord.user?.phoneNumber || landlord.phoneNumber,
        dateJoined: landlord.user?.createdAt || landlord.createdAt,
        status: landlordStatus ? 'Active' : 'Inactive',
        description: landlord.description,
        proofOfGovernmentIssuedId: landlord.governmentIssuedId
    };
};

/**
 * Get agent by ID with details
 * @param {string} id - Agent ID
 * @returns {Object} - Agent object with details
 */
export const getAgentById = async (id) => {
    const agent = await Agent.findById(id)
        .populate('user', 'firstName lastName email phoneNumber profileImage dateOfBirth gender isActive createdAt')
        .lean();

    if (!agent) {
        throw new Error('Agent not found');
    }

    const agentStatus = agent.user?.isActive !== undefined ? agent.user.isActive : true;

    return {
        id: agent._id,
        image: agent.user?.profileImage || agent.profileImage,
        name: `${agent.user?.firstName || agent.firstName} ${agent.user?.lastName || agent.lastName}`,
        dateOfBirth: agent.user?.dateOfBirth || agent.dateOfBirth,
        gender: agent.user?.gender || agent.gender,
        email: agent.user?.email || agent.email,
        phoneNumber: agent.user?.phoneNumber || agent.phoneNumber,
        dateJoined: agent.user?.createdAt || agent.createdAt,
        status: agentStatus ? 'Active' : 'Inactive',
        description: agent.description,
        proofOfGovernmentIssuedId: agent.governmentIssuedId
    };
};

/**
 * Update user profile based on role
 * @param {string} userId - User ID
 * @param {string} role - User role (tenant, landlord, agent)
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user object
 */
export const updateUserProfile = async (userId, role, updateData) => {
    const { firstName, lastName, email, phoneNumber, gender, address, governmentIssuedId } = updateData;

    // Validate role
    if (!['tenant', 'landlord', 'agent'].includes(role)) {
        throw new Error('Invalid role specified');
    }

    // Check if email is already taken by another user
    if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            throw new Error('Email is already taken by another user');
        }
    }

    let updatedUser;
    let updatedProfile;

    // Update based on role
    switch (role) {
        case 'tenant':
            // Update tenant profile
            updatedProfile = await Tenant.findOneAndUpdate(
                { user: userId },
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    gender,
                    address
                },
                { new: true, runValidators: true }
            );

            if (!updatedProfile) {
                throw new Error('Tenant profile not found');
            }

            // Update user profile
            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    gender
                },
                { new: true, runValidators: true }
            );
            break;

        case 'landlord':
            // Validate government issued ID for landlord
            if (!governmentIssuedId) {
                throw new Error('Government issued ID is required for landlords');
            }

            // Update landlord profile
            updatedProfile = await Landlord.findOneAndUpdate(
                { user: userId },
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    gender,
                    address,
                    governmentIssuedId
                },
                { new: true, runValidators: true }
            );

            if (!updatedProfile) {
                throw new Error('Landlord profile not found');
            }

            // Update user profile
            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    gender
                },
                { new: true, runValidators: true }
            );
            break;

        case 'agent':
            // Validate government issued ID for agent
            if (!governmentIssuedId) {
                throw new Error('Government issued ID is required for agents');
            }

            // Update agent profile
            updatedProfile = await Agent.findOneAndUpdate(
                { user: userId },
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    gender,
                    governmentIssuedId
                },
                { new: true, runValidators: true }
            );

            if (!updatedProfile) {
                throw new Error('Agent profile not found');
            }

            // Update user profile
            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    gender
                },
                { new: true, runValidators: true }
            );
            break;

        default:
            throw new Error('Invalid role specified');
    }

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        gender: updatedUser.gender,
        role: updatedUser.role,
        address: updatedProfile.address,
        governmentIssuedId: updatedProfile.governmentIssuedId,
        updatedAt: updatedUser.updatedAt
    };
};
