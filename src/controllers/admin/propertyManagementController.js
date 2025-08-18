import * as propertyManagementService from '../../services/admin/propertyManagementService.js';

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

        const result = await propertyManagementService.getPaginatedProperties({
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