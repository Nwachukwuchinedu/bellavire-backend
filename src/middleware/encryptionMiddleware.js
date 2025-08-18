import { encrypt, decrypt, isEncrypted } from '../utils/encryption.js';

/**
 * Middleware to decrypt incoming request bodies
 */
export const decryptRequest = (req, res, next) => {
    // Skip encryption for Swagger UI requests
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const isSwaggerRequest = userAgent.includes('Swagger') ||
        referer.includes('/api-docs') ||
        req.headers['x-swagger-test'] === 'true';

    if (isSwaggerRequest) {
        console.log('📚 Swagger request detected, skipping encryption');
        return next();
    }

    // Only process POST, PUT, PATCH requests with bodies
    if (!['POST', 'PUT', 'PATCH'].includes(req.method) || !req.body) {
        console.log('🔍 Skipping decryption - method:', req.method, 'has body:', !!req.body);
        return next();
    }

    console.log('🔍 Decrypting request for:', req.method, req.url);
    console.log('🔍 Request body type:', typeof req.body);
    console.log('🔍 Request body:', JSON.stringify(req.body, null, 2));

    try {
        // Check if the request body is encrypted
        if (typeof req.body === 'string' && isEncrypted(req.body)) {
            console.log('🔍 Detected encrypted string body');
            // Decrypt the body
            const decryptedData = decrypt(req.body);
            req.body = decryptedData;
            console.log('✅ Request body decrypted successfully');
            console.log('🔍 Decrypted body:', JSON.stringify(decryptedData, null, 2));
        } else if (req.body.encryptedData && isEncrypted(req.body.encryptedData)) {
            console.log('🔍 Detected encrypted data in property');
            // Handle case where encrypted data is in a property
            const decryptedData = decrypt(req.body.encryptedData);
            req.body = decryptedData;
            console.log('✅ Request body decrypted successfully');
            console.log('🔍 Decrypted body:', JSON.stringify(decryptedData, null, 2));
        } else {
            console.log('🔍 Request body is not encrypted, proceeding as-is');
        }

        next();
    } catch (error) {
        console.error('❌ Request decryption failed:', error.message);
        console.error('❌ Error stack:', error.stack);
        return res.status(400).json({
            status: false,
            message: 'Invalid encrypted data',
            error: 'Decryption failed'
        });
    }
};

/**
 * Middleware to encrypt outgoing responses
 */
export const encryptResponse = (req, res, next) => {
    // Skip encryption for Swagger UI requests
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const isSwaggerRequest = userAgent.includes('Swagger') ||
        referer.includes('/api-docs') ||
        req.headers['x-swagger-test'] === 'true';

    if (isSwaggerRequest) {
        console.log('📚 Swagger response detected, skipping encryption');
        return next();
    }

    // Store the original send method
    const originalSend = res.send;

    // Override the send method
    res.send = function (data) {
        console.log('🔍 Encrypting response for:', req.method, req.originalUrl || req.url);
        console.log('🔍 Response data type:', typeof data);
        console.log('🔍 Response data:', JSON.stringify(data, null, 2));

        try {
            // Only encrypt JSON responses
            if (data && typeof data === 'object') {
                const encryptedData = encrypt(data);
                console.log('✅ Response encrypted successfully');
                console.log('🔍 Encrypted response length:', encryptedData.length);

                // Send encrypted data with a special header
                res.setHeader('X-Encrypted', 'true');
                console.log('🔍 Set X-Encrypted header to true');
                return originalSend.call(this, encryptedData);
            } else if (typeof data === 'string') {
                // Try to parse as JSON first
                try {
                    const jsonData = JSON.parse(data);
                    const encryptedData = encrypt(jsonData);
                    console.log('✅ Response encrypted successfully');
                    console.log('🔍 Encrypted response length:', encryptedData.length);

                    res.setHeader('X-Encrypted', 'true');
                    console.log('🔍 Set X-Encrypted header to true (string case)');
                    return originalSend.call(this, encryptedData);
                } catch {
                    // If it's not JSON, send as-is
                    console.log('🔍 Response is not JSON, sending as-is');
                    return originalSend.call(this, data);
                }
            } else {
                // For other data types, send as-is
                console.log('🔍 Response is not object/string, sending as-is');
                return originalSend.call(this, data);
            }
        } catch (error) {
            console.error('❌ Response encryption failed:', error.message);
            console.error('❌ Error stack:', error.stack);
            // Fallback to original send method
            return originalSend.call(this, data);
        }
    };

    next();
};

/**
 * Combined middleware that handles both encryption and decryption
 */
export const encryptionMiddleware = [decryptRequest, encryptResponse];

/**
 * Middleware to handle multipart form data (file uploads)
 * Skips encryption for multipart requests and Swagger UI
 */
export const handleMultipartRequests = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const isSwaggerRequest = userAgent.includes('Swagger') ||
        referer.includes('/api-docs') ||
        req.headers['x-swagger-test'] === 'true';

    if (contentType.includes('multipart/form-data')) {
        // Skip encryption for file uploads
        console.log('📁 Multipart request detected, skipping encryption');
        return next();
    }

    if (isSwaggerRequest) {
        // Skip encryption for Swagger UI requests
        console.log('📚 Swagger request detected, skipping encryption');
        return next();
    }

    // Apply encryption middleware for other requests
    return encryptionMiddleware[0](req, res, () => {
        return encryptionMiddleware[1](req, res, next);
    });
};
