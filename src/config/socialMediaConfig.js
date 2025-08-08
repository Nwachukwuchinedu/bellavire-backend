/**
 * Social Media OAuth Configuration
 * This file contains OAuth client IDs and secrets for social media platforms
 * In production, these should be stored as environment variables
 */

const socialMediaConfig = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/tenants/auth/google/callback`
    },
    microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID || '',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/tenants/auth/microsoft/callback`
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/tenants/auth/linkedin/callback`
    },
    instagram: {
        clientId: process.env.INSTAGRAM_CLIENT_ID || '',
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/tenants/auth/instagram/callback`
    }
};

/**
 * Get configuration for a specific platform
 * @param {string} platform - The social media platform
 * @returns {Object} Platform configuration
 */
export const getPlatformConfig = (platform) => {
    const config = socialMediaConfig[platform];
    if (!config) {
        throw new Error(`Configuration not found for platform: ${platform}`);
    }
    return config;
};

/**
 * Check if a platform is configured
 * @param {string} platform - The social media platform
 * @returns {boolean} Whether the platform is configured
 */
export const isPlatformConfigured = (platform) => {
    const config = socialMediaConfig[platform];
    return config && config.clientId && config.clientSecret;
};

/**
 * Get all configured platforms
 * @returns {Array} List of configured platforms
 */
export const getConfiguredPlatforms = () => {
    return Object.keys(socialMediaConfig).filter(platform => 
        isPlatformConfigured(platform)
    );
};

export default socialMediaConfig; 