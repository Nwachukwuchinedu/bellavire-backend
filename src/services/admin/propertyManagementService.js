import Property from '../../models/Property.js';
import Landlord from '../../models/Landlord.js';
import Agent from '../../models/Agent.js';
import Tenant from '../../models/Tenant.js';
import Room from '../../models/Room.js';
import Lease from '../../models/Lease.js';

// Get paginated properties with search and filters
export const getPaginatedProperties = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        cityOrTown = '',
        propertyType = '',
        status = ''
    } = options;

    // Build search filter
    let searchFilter = {};
    if (search) {
        searchFilter = {
            $or: [
                { address: { $regex: search, $options: 'i' } },
                { addressLine1: { $regex: search, $options: 'i' } },
                { addressLine2: { $regex: search, $options: 'i' } },
                { propertyName: { $regex: search, $options: 'i' } },
                { 'landlord.firstName': { $regex: search, $options: 'i' } },
                { 'landlord.lastName': { $regex: search, $options: 'i' } },
                { 'agent.firstName': { $regex: search, $options: 'i' } },
                { 'agent.lastName': { $regex: search, $options: 'i' } }
            ]
        };
    }

    // Build filters
    let filters = {};

    if (cityOrTown && cityOrTown !== 'all') {
        filters.cityOrTown = { $regex: cityOrTown, $options: 'i' };
    }

    if (propertyType && propertyType !== 'all') {
        filters.propertyType = propertyType;
    }

    if (status && status !== 'all') {
        filters.status = status;
    }

    // Combine all filters
    const combinedFilter = {
        ...searchFilter,
        ...filters
    };

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Property.countDocuments(combinedFilter);

    // Get properties with populated data
    const properties = await Property.find(combinedFilter)
        .populate('landlord', 'firstName lastName')
        .populate('agent', 'firstName lastName')
        .populate('tenant', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Transform data to include owner name, agent name, and determine status
    const transformedProperties = properties.map(property => {
        // Determine owner name
        let ownerName = '';
        if (property.landlord) {
            ownerName = `${property.landlord.firstName || ''} ${property.landlord.lastName || ''}`.trim();
        }

        // Determine agent name
        let agentName = '';
        if (property.agent) {
            agentName = `${property.agent.firstName || ''} ${property.agent.lastName || ''}`.trim();
        }

        // Determine status based on tenant presence and property status
        let propertyStatus = property.status || 'vacant';
        if (property.tenant && propertyStatus === 'vacant') {
            propertyStatus = 'occupied';
        }

        return {
            id: property._id,
            propertyAddress: property.address,
            propertyType: property.propertyType,
            ownerName,
            status: propertyStatus,
            agentName,
            propertyName: property.propertyName,
            cityOrTown: property.cityOrTown,
            monthlyRent: property.monthlyRent,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            furnished: property.furnished,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt
        };
    });

    return {
        properties: transformedProperties,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        }
    };
};

// Get detailed property information
export const getPropertyDetailsById = async (propertyId) => {
    const property = await Property.findById(propertyId)
        .populate('landlord', 'firstName lastName profileImage dateOfBirth email')
        .populate('agent', 'firstName lastName profileImage dateOfBirth email')
        .lean();

    if (!property) {
        throw new Error('Property not found');
    }

    // Transform the data according to requirements
    const transformedProperty = {
        // Property basic info
        propertyName: property.propertyName,
        depositAmount: property.depositAmount,
        paymentFrequency: property.paymentFrequency,

        // Property details
        propertyDetails: {
            propertyImages: property.propertyImages,
            description: property.description,
            address: property.address,
            billsIncluded: property.billsIncluded,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms
        },

        // Facilities
        facilities: property.amenities,

        // Landlord information
        landlord: property.landlord ? {
            name: `${property.landlord.firstName || ''} ${property.landlord.lastName || ''}`.trim(),
            profilePicture: property.landlord.profileImage,
            dateOfBirth: property.landlord.dateOfBirth,
            propertyType: property.propertyType, // Property type for landlord
            email: property.landlord.email,
            propertyName: property.propertyName // Property name for landlord
        } : null,

        // Agent information
        agent: property.agent ? {
            name: `${property.agent.firstName || ''} ${property.agent.lastName || ''}`.trim(),
            profilePicture: property.agent.profileImage,
            dateOfBirth: property.agent.dateOfBirth,
            email: property.agent.email,
            propertyName: property.propertyName // Property name for agent
        } : null
    };

    return transformedProperty;
};

// Get tenant information with room and lease details
export const getTenantWithRoomAndLeaseInfo = async (propertyId) => {
    try {
        // Find all rooms for the property
        const rooms = await Room.find({ propertyId })
            .populate({
                path: 'currentLeaseId',
                populate: {
                    path: 'tenantId',
                    select: 'firstName lastName profileImage'
                }
            })
            .lean();

        // Filter rooms that have active leases with tenants
        const occupiedRooms = rooms.filter(room =>
            room.currentLeaseId &&
            room.currentLeaseId.tenantId &&
            room.currentLeaseId.status === 'active'
        );

        // Transform the data to include tenant, room, and lease information
        const tenantRoomLeaseInfo = occupiedRooms.map(room => {
            const lease = room.currentLeaseId;
            const tenant = lease.tenantId;

            return {
                tenant: {
                    name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim(),
                    profileImage: tenant.profileImage
                },
                room: {
                    roomNumber: room.roomNumber,
                    roomIdentifier: room.roomIdentifier,
                    status: room.status
                },
                lease: {
                    startDate: lease.startDate,
                    expirationDate: lease.expirationDate,
                    duration: lease.duration,
                    status: lease.status,
                    rent: lease.rent
                }
            };
        });

        return {
            success: true,
            data: tenantRoomLeaseInfo,
            totalOccupiedRooms: tenantRoomLeaseInfo.length
        };

    } catch (error) {
        throw new Error(`Failed to get tenant information: ${error.message}`);
    }
};

