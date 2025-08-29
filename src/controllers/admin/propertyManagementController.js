import { getPaginatedProperties, getPropertyDetailsById, getTenantWithRoomAndLeaseInfo } from '../../services/admin/propertyManagementService.js';

/**
 * Get paginated properties with search and filters
 */
export const getProperties = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            cityOrTown = '',
            propertyType = '',
            status = ''
        } = req.query;

        const result = await getPaginatedProperties({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            cityOrTown,
            propertyType,
            status
        });

        res.json({
            status: true,
            data: result,
            message: "Properties retrieved successfully"
        });
    } catch (err) {
        console.error('Error in getProperties:', err);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve properties",
            error: err.message
        });
    }
};

/**
 * Get detailed property information by ID
 */
export const getPropertyDetails = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Property ID is required"
            });
        }

        const propertyDetails = await getPropertyDetailsById(propertyId);

        res.json({
            status: true,
            data: propertyDetails,
            message: "Property details retrieved successfully"
        });
    } catch (err) {
        console.error('Error in getPropertyDetails:', err);

        if (err.message === 'Property not found') {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found"
            });
        }

        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve property details",
            error: err.message
        });
    }
};

/**
 * Get tenant information with room and lease details by property ID
 */
export const getTenantWithRoomAndLeaseInfo = async (req, res) => {
    try {
        const { propertyId } = req.params;

        if (!propertyId) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Property ID is required"
            });
        }

        const result = await getTenantWithRoomAndLeaseInfo(propertyId);

        res.json({
            status: true,
            data: result.data,
            message: "Tenant information retrieved successfully",
            totalOccupiedRooms: result.totalOccupiedRooms
        });
    } catch (err) {
        console.error('Error in getTenantWithRoomAndLeaseInfo:', err);

        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve tenant information",
            error: err.message
        });
    }
};