import {
    getPaginatedUsers,
    getTenantByIdAndPropertyById,
    getLandlordById,
    getAgentById,
    updateUserProfile
} from '../../services/admin/userManagementService.js';
import User from '../../models/User.js';

export const getUsers = async (req, res) => {
    try {
        const { page, limit, search, role, status, dateFrom, dateTo } = req.query;
        const result = await getPaginatedUsers({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            search,
            role,
            status,
            dateFrom,
            dateTo
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTenant = async (req, res) => {
    try {
        const { tenantId, propertyId } = req.params;
        const tenant = await getTenantByIdAndPropertyById(tenantId, propertyId);
        res.json({
            status: true,
            data: tenant,
            message: "Tenant and property details retrieved successfully"
        });
    } catch (err) {
        res.status(404).json({
            status: false,
            message: err.message || "Tenant or property not found"
        });
    }
};

export const getLandlord = async (req, res) => {
    try {
        const { id } = req.params;
        const landlord = await getLandlordById(id);
        res.json({
            status: true,
            data: landlord,
            message: "Landlord retrieved successfully"
        });
    } catch (err) {
        res.status(404).json({
            status: false,
            message: err.message || "Landlord not found"
        });
    }
};

export const getAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await getAgentById(id);
        res.json({
            status: true,
            data: agent,
            message: "Agent retrieved successfully"
        });
    } catch (err) {
        res.status(404).json({
            status: false,
            message: err.message || "Agent not found"
        });
    }
};

export const editUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, phoneNumber, gender, address, governmentIssuedId } = req.body;

        // Get user to determine role
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        const updateData = {
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            address,
            governmentIssuedId
        };

        const updatedUser = await updateUserProfile(userId, user.role, updateData);

        res.json({
            status: true,
            data: updatedUser,
            message: "Profile updated successfully"
        });
    } catch (err) {
        res.status(400).json({
            status: false,
            message: err.message || "Failed to update profile"
        });
    }
};
