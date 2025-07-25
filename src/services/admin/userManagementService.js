import User from '../../models/User.js';

/**
 * Get paginated users with search and filter
 * @param {Object} params - { page, limit, search, role, status, dateFrom, dateTo }
 * @returns {Object} - { total, page, limit, totalPages, users }
 */
export const getPaginatedUsers = async ({ page = 1, limit = 10, search, role, status, dateFrom, dateTo }) => {
    const skip = (page - 1) * limit;
    const query = {};

    // Search by name or email
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
    // Filter by date joined
    if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query, {
        firstName: 1,
        lastName: 1,
        email: 1,
        role: 1,
        phoneNumber: 1,
        createdAt: 1,
        isActive: 1
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

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
