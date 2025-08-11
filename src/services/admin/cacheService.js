import NodeCache from 'node-cache';

// Cache instance with 5 minutes TTL (Time To Live)
const cache = new NodeCache({
    stdTTL: 300, // 5 minutes
    checkperiod: 60, // Check for expired keys every minute
    useClones: false // Better performance
});

/**
 * Cache service for admin dashboard data
 * Reduces database load and improves response times
 */
export class DashboardCacheService {
    static CACHE_KEYS = {
        DASHBOARD_OVERVIEW: 'dashboard_overview',
        USER_COUNTS: 'user_counts',
        RECENT_TENANTS: 'recent_tenants',
        ADMIN_NOTIFICATIONS: 'admin_notifications'
    };

    /**
     * Get cached data or return null if not found/expired
     */
    static get(key) {
        return cache.get(key);
    }

    /**
     * Set data in cache with optional TTL
     */
    static set(key, data, ttl = 300) {
        return cache.set(key, data, ttl);
    }

    /**
     * Delete specific cache key
     */
    static delete(key) {
        return cache.del(key);
    }

    /**
     * Clear all cache
     */
    static clear() {
        return cache.flushAll();
    }

    /**
     * Get dashboard overview with caching
     */
    static async getCachedDashboardOverview(adminId, fetchFunction) {
        const cacheKey = `${this.CACHE_KEYS.DASHBOARD_OVERVIEW}_${adminId}`;

        // Try to get from cache first
        let data = this.get(cacheKey);

        if (data) {
            return data;
        }

        // If not in cache, fetch from database
        data = await fetchFunction();

        // Cache the result for 2 minutes
        this.set(cacheKey, data, 120);

        return data;
    }

    /**
     * Invalidate dashboard cache for specific admin
     */
    static invalidateDashboardCache(adminId) {
        const cacheKey = `${this.CACHE_KEYS.DASHBOARD_OVERVIEW}_${adminId}`;
        this.delete(cacheKey);
    }

    /**
     * Get cache statistics
     */
    static getStats() {
        return cache.getStats();
    }
} 