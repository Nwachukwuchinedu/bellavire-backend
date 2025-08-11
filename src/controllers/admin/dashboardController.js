import * as dashboardService from '../../services/admin/dashboardService.js';
import { DashboardCacheService } from '../../services/admin/cacheService.js';

export const getDashboardOverview = async (req, res) => {
    try {
        // Use caching for better performance
        const dashboardData = await DashboardCacheService.getCachedDashboardOverview(
            req.admin.adminId,
            async () => {
                // Run all async operations in parallel for maximum performance
                const [
                    users,
                    tenants,
                    landlords,
                    agents,
                    properties,
                    recentTenantsAll,
                    recentTenants30days,
                    recentTenants7days,
                    recentTenants24hours,
                    notifications
                ] = await Promise.all([
                    dashboardService.getTotalUsers(),
                    dashboardService.getTotalTenants(),
                    dashboardService.getTotalLandlords(),
                    dashboardService.getTotalAgents(),
                    dashboardService.getAllProperties(),
                    dashboardService.getRecentTenants('all'),
                    dashboardService.getRecentTenants('30days'),
                    dashboardService.getRecentTenants('7days'),
                    dashboardService.getRecentTenants('24hours'),
                    dashboardService.getAdminNotifications(req.admin.adminId)
                ]);

                return {
                    totals: { users, tenants, landlords, agents },
                    properties,
                    notifications,
                    recentTenants: {
                        all: recentTenantsAll,
                        days30: recentTenants30days,
                        days7: recentTenants7days,
                        hours24: recentTenants24hours
                    }
                };
            }
        );

        res.json(dashboardData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
