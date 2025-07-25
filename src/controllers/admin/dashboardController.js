import * as dashboardService from '../../services/admin/dashboardService.js';

export const getDashboardOverview = async (req, res) => {
    try {
        const [users, tenants, landlords, agents] = await Promise.all([
            dashboardService.getTotalUsers(),
            dashboardService.getTotalTenants(),
            dashboardService.getTotalLandlords(),
            dashboardService.getTotalAgents()
        ]);
        const properties = await dashboardService.getAllProperties();
        const recentTenantsAll = await dashboardService.getRecentTenants('all');
        const recentTenants30days = await dashboardService.getRecentTenants('30days');
        const recentTenants7days = await dashboardService.getRecentTenants('7days');
        const recentTenants24hours = await dashboardService.getRecentTenants('24hours');
        let notifications = [];
        if (req.query.adminId) {
            notifications = await dashboardService.getAdminNotifications(req.query.adminId);
        }
        res.json({
            totals: { users, tenants, landlords, agents },
            properties,
            notifications,
            recentTenants: {
                all: recentTenantsAll,
                days30: recentTenants30days,
                days7: recentTenants7days,
                hours24: recentTenants24hours
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
