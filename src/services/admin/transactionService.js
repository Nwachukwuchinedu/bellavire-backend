import Payment from '../../models/Payment.js';
import Tenant from '../../models/Tenant.js';
import Property from '../../models/Property.js';

// Get paginated transactions with search and filters
export const getPaginatedTransactions = async (options = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        period = 'all'
    } = options;

    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();

    if (period === '30days') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    } else if (period === '7days') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === '24hours') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
    }

    // Build status filter
    let statusFilter = {};
    if (status && status !== 'all') {
        statusFilter = { status };
    }

    // Build search filter
    let searchFilter = {};
    if (search) {
        searchFilter = {
            $or: [
                { transactionId: { $regex: search, $options: 'i' } },
                { 'tenant.firstName': { $regex: search, $options: 'i' } },
                { 'tenant.lastName': { $regex: search, $options: 'i' } },
                { 'property.propertyName': { $regex: search, $options: 'i' } }
            ]
        };
    }

    // Combine all filters
    const combinedFilter = {
        ...dateFilter,
        ...statusFilter,
        ...searchFilter
    };

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Payment.countDocuments(combinedFilter);

    // Get transactions with populated data
    const transactions = await Payment.find(combinedFilter)
        .populate('tenant', 'firstName lastName profileImage user')
        .populate('property', 'propertyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Transform data to include tenant name and profile image
    const transformedTransactions = transactions.map(transaction => {
        const tenant = transaction.tenant;
        let tenantName = '';
        let tenantProfileImage = '';

        if (tenant) {
            if (tenant.user) {
                tenantName = `${tenant.user.firstName || ''} ${tenant.user.lastName || ''}`.trim();
                tenantProfileImage = tenant.user.profileImage || '';
            } else {
                tenantName = `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim();
                tenantProfileImage = tenant.profileImage || '';
            }
        }

        return {
            transactionId: transaction.transactionId,
            tenantName,
            tenantProfileImage,
            propertyName: transaction.property?.propertyName || '',
            amount: transaction.amount,
            paymentDate: transaction.paymentDate,
            status: transaction.status,
            createdAt: transaction.createdAt
        };
    });

    return {
        transactions: transformedTransactions,
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

// Get transaction analytics
export const getTransactionAnalytics = async () => {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousMonth = new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayBeforeYesterday = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000);

    // Get current month total volume
    const currentMonthVolume = await Payment.aggregate([
        {
            $match: {
                status: 'successful',
                createdAt: { $gte: lastMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    // Get previous month total volume
    const previousMonthVolume = await Payment.aggregate([
        {
            $match: {
                status: 'successful',
                createdAt: { $gte: previousMonth, $lt: lastMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    // Get pending transactions count and amount
    const pendingTransactions = await Payment.aggregate([
        {
            $match: { status: 'pending' }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    // Get yesterday's pending transactions
    const yesterdayPending = await Payment.aggregate([
        {
            $match: {
                status: 'pending',
                createdAt: { $gte: yesterday, $lt: now }
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    // Get failed transactions count
    const failedTransactions = await Payment.countDocuments({ status: 'failed' });

    // Calculate average completion time (time from pending to successful)
    const completionTimes = await Payment.aggregate([
        {
            $match: {
                status: 'successful',
                paymentDate: { $exists: true, $ne: null }
            }
        },
        {
            $addFields: {
                completionTimeHours: {
                    $divide: [
                        { $subtract: ['$paymentDate', '$createdAt'] },
                        1000 * 60 * 60 // Convert milliseconds to hours
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgCompletionTime: { $avg: '$completionTimeHours' }
            }
        }
    ]);

    // Calculate previous month's average completion time
    const previousMonthCompletionTimes = await Payment.aggregate([
        {
            $match: {
                status: 'successful',
                paymentDate: { $exists: true, $ne: null },
                createdAt: { $gte: previousMonth, $lt: lastMonth }
            }
        },
        {
            $addFields: {
                completionTimeHours: {
                    $divide: [
                        { $subtract: ['$paymentDate', '$createdAt'] },
                        1000 * 60 * 60
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgCompletionTime: { $avg: '$completionTimeHours' }
            }
        }
    ]);

    // Calculate percentage changes
    const currentVolume = currentMonthVolume[0]?.total || 0;
    const previousVolume = previousMonthVolume[0]?.total || 0;
    const volumeChange = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : 0;

    const currentAvgTime = completionTimes[0]?.avgCompletionTime || 0;
    const previousAvgTime = previousMonthCompletionTimes[0]?.avgCompletionTime || 0;
    const timeChange = previousAvgTime > 0 ? ((currentAvgTime - previousAvgTime) / previousAvgTime) * 100 : 0;

    return {
        totalVolume: {
            amount: currentVolume,
            percentageChange: volumeChange,
            trend: volumeChange > 0 ? 'increase' : volumeChange < 0 ? 'decrease' : 'no_change'
        },
        pendingTransactions: {
            count: pendingTransactions[0]?.count || 0,
            amount: pendingTransactions[0]?.totalAmount || 0,
            yesterdayCount: yesterdayPending[0]?.count || 0,
            yesterdayAmount: yesterdayPending[0]?.totalAmount || 0
        },
        failedTransactions: {
            count: failedTransactions
        },
        averageCompletionTime: {
            hours: currentAvgTime,
            percentageChange: timeChange,
            trend: timeChange > 0 ? 'slower' : timeChange < 0 ? 'faster' : 'no_change'
        }
    };
};
