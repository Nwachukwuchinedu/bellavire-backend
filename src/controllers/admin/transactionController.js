import * as transactionService from '../../services/admin/transactionService.js';

/**
 * Get paginated transactions with search and filters
 */
export const getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            period = 'all'
        } = req.query;

        const result = await transactionService.getPaginatedTransactions({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            status,
            period
        });

        res.json({
            status: true,
            data: result,
            message: "Transactions retrieved successfully"
        });
    } catch (err) {
        console.error('Error in getTransactions:', err);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve transactions",
            error: err.message
        });
    }
};

/**
 * Get transaction analytics
 */
export const getTransactionAnalytics = async (req, res) => {
    try {
        const analytics = await transactionService.getTransactionAnalytics();

        res.json({
            status: true,
            data: analytics,
            message: "Transaction analytics retrieved successfully"
        });
    } catch (err) {
        console.error('Error in getTransactionAnalytics:', err);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve transaction analytics",
            error: err.message
        });
    }
};
