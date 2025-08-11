import compression from 'compression';

/**
 * Compression middleware to reduce response size
 * This will significantly improve performance for large JSON responses
 */
export const compressionMiddleware = compression({
    // Only compress responses larger than 1KB
    threshold: 1024,

    // Compression level (0-9, higher = more compression but slower)
    level: 6,

    // Filter function to determine what to compress
    filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
            return false;
        }

        // Use default compression filter
        return compression.filter(req, res);
    }
}); 