import mongoose from 'mongoose';

/**
 * Performance monitoring middleware
 * Tracks response times and logs slow requests
 */
export const performanceMiddleware = (req, res, next) => {
    const start = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - start;

        // Log slow requests (over 1 second)
        if (responseTime > 1000) {
            console.warn(`⚠️  Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
        }

        // Safely add response time header (only if headers haven't been sent)
        try {
            if (!res.headersSent) {
                res.setHeader('X-Response-Time', `${responseTime}ms`);
            }
        } catch (error) {
            // Ignore header setting errors
        }

        // Log all requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`${req.method} ${req.originalUrl} - ${responseTime}ms - ${res.statusCode}`);
        }

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Database query performance monitoring
 * Wraps Mongoose queries to track slow database operations
 */
export const dbPerformanceMonitor = (req, res, next) => {
    // Only set up monitoring once
    if (mongoose.Query.prototype._performanceMonitoringSet) {
        return next();
    }

    // Store original query methods
    const originalFind = mongoose.Query.prototype.find;
    const originalCountDocuments = mongoose.Query.prototype.countDocuments;

    // Override find method
    mongoose.Query.prototype.find = function () {
        const start = Date.now();
        const query = originalFind.apply(this, arguments);

        query.then(() => {
            const duration = Date.now() - start;
            if (duration > 500) { // Log queries over 500ms
                console.warn(`🐌 Slow DB query: ${duration}ms - Collection: ${this.model?.collection?.name || 'unknown'}`);
            }
        }).catch(() => {
            // Ignore errors in performance monitoring
        });

        return query;
    };

    // Override countDocuments method
    mongoose.Query.prototype.countDocuments = function () {
        const start = Date.now();
        const query = originalCountDocuments.apply(this, arguments);

        query.then(() => {
            const duration = Date.now() - start;
            if (duration > 500) { // Log queries over 500ms
                console.warn(`🐌 Slow DB count: ${duration}ms - Collection: ${this.model?.collection?.name || 'unknown'}`);
            }
        }).catch(() => {
            // Ignore errors in performance monitoring
        });

        return query;
    };

    // Mark as set to prevent multiple overrides
    mongoose.Query.prototype._performanceMonitoringSet = true;

    next();
}; 