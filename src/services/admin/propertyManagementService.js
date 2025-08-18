import Property from '../../models/Property.js';
import Landlord from '../../models/Landlord.js';
import Agent from '../../models/Agent.js';
import Tenant from '../../models/Tenant.js';

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

