import { getPaginatedUsers } from '../../services/admin/userManagementService.js';

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
