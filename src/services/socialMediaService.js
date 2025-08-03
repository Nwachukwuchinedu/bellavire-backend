import axios from 'axios';

/**
 * Service for handling social media platform integrations
 */
class SocialMediaService {
    constructor() {
        this.platforms = {
            google: {
                name: 'Google',
                apiBase: 'https://www.googleapis.com',
                oauthBase: 'https://accounts.google.com',
                scopes: ['profile', 'email']
            },
            microsoft: {
                name: 'Microsoft',
                apiBase: 'https://graph.microsoft.com/v1.0',
                oauthBase: 'https://login.microsoftonline.com',
                scopes: ['User.Read']
            },
            linkedin: {
                name: 'LinkedIn',
                apiBase: 'https://api.linkedin.com/v2',
                oauthBase: 'https://www.linkedin.com',
                scopes: ['r_liteprofile', 'r_emailaddress']
            },
            instagram: {
                name: 'Instagram',
                apiBase: 'https://graph.instagram.com',
                oauthBase: 'https://api.instagram.com',
                scopes: ['user_profile', 'user_media']
            }
        };
    }

    /**
     * Get OAuth authorization URL for a platform
     * @param {string} platform - The social media platform
     * @param {string} clientId - OAuth client ID
     * @param {string} redirectUri - OAuth redirect URI
     * @param {string} state - State parameter for security
     * @returns {string} Authorization URL
     */
    getAuthorizationUrl(platform, clientId, redirectUri, state) {
        const platformConfig = this.platforms[platform];
        if (!platformConfig) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Use provided redirectUri or fallback to environment variable
        const finalRedirectUri = redirectUri || `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/tenants/auth/${platform}/callback`;
        


        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: finalRedirectUri,
            response_type: 'code',
            scope: platformConfig.scopes.join(' '),
            state: state
        });

        switch (platform) {
            case 'google':
                return `${platformConfig.oauthBase}/o/oauth2/v2/auth?${params}`;
            case 'microsoft':
                return `${platformConfig.oauthBase}/common/oauth2/v2.0/authorize?${params}`;
            case 'linkedin':
                return `${platformConfig.oauthBase}/oauth/v2/authorization?${params}`;
            case 'instagram':
                return `${platformConfig.oauthBase}/oauth/authorize?${params}`;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
    }

    /**
     * Exchange authorization code for access token
     * @param {string} platform - The social media platform
     * @param {string} code - Authorization code
     * @param {string} clientId - OAuth client ID
     * @param {string} clientSecret - OAuth client secret
     * @param {string} redirectUri - OAuth redirect URI
     * @returns {Promise<Object>} Token response
     */
    async exchangeCodeForToken(platform, code, clientId, clientSecret, redirectUri) {
        const platformConfig = this.platforms[platform];
        if (!platformConfig) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Use provided redirectUri or fallback to environment variable
        const finalRedirectUri = redirectUri || `${process.env.BACKEND_BASE_URL || 'http://localhost:5000'}/api/tenants/auth/${platform}/callback`;

        const tokenData = {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: finalRedirectUri,
            code: code,
            grant_type: 'authorization_code'
        };

        let tokenUrl;
        switch (platform) {
            case 'google':
                tokenUrl = `${platformConfig.oauthBase}/oauth2/v4/token`;
                break;
            case 'microsoft':
                tokenUrl = `${platformConfig.oauthBase}/common/oauth2/v2.0/token`;
                break;
            case 'linkedin':
                tokenUrl = `${platformConfig.oauthBase}/oauth/v2/accessToken`;
                break;
            case 'instagram':
                tokenUrl = `${platformConfig.oauthBase}/oauth/access_token`;
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        try {
            const response = await axios.post(tokenUrl, tokenData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to exchange code for token: ${error.message}`);
        }
    }

    /**
     * Get user profile information from social platform
     * @param {string} platform - The social media platform
     * @param {string} accessToken - OAuth access token
     * @returns {Promise<Object>} User profile information
     */
    async getUserProfile(platform, accessToken) {
        const platformConfig = this.platforms[platform];
        if (!platformConfig) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        let profileUrl;
        let headers = {
            'Authorization': `Bearer ${accessToken}`
        };

        switch (platform) {
            case 'google':
                profileUrl = `${platformConfig.apiBase}/oauth2/v2/userinfo`;
                break;
            case 'microsoft':
                profileUrl = `${platformConfig.apiBase}/me`;
                break;
            case 'linkedin':
                profileUrl = `${platformConfig.apiBase}/me`;
                break;
            case 'instagram':
                profileUrl = `${platformConfig.apiBase}/me?fields=id,username,account_type,media_count`;
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        try {
            const response = await axios.get(profileUrl, { headers });
            return this.formatProfileData(platform, response.data);
        } catch (error) {
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }

    /**
     * Format profile data according to our schema
     * @param {string} platform - The social media platform
     * @param {Object} rawData - Raw profile data from platform
     * @returns {Object} Formatted profile data
     */
    formatProfileData(platform, rawData) {
        switch (platform) {
            case 'google':
                return {
                    accountId: rawData.email,
                    profileInfo: {
                        name: rawData.name,
                        email: rawData.email,
                        picture: rawData.picture
                    }
                };
            case 'microsoft':
                return {
                    accountId: rawData.userPrincipalName,
                    profileInfo: {
                        name: rawData.displayName,
                        email: rawData.userPrincipalName,
                        picture: rawData.photo || null
                    }
                };
            case 'linkedin':
                return {
                    accountId: rawData.id,
                    profileInfo: {
                        name: `${rawData.localizedFirstName} ${rawData.localizedLastName}`,
                        headline: rawData.headline || null,
                        picture: rawData.profilePicture || null,
                        company: rawData.company || null
                    }
                };
            case 'instagram':
                return {
                    accountId: rawData.id,
                    profileInfo: {
                        username: rawData.username,
                        fullName: rawData.full_name || null,
                        picture: rawData.profile_picture_url || null,
                        bio: rawData.bio || null
                    }
                };
            default:
                return rawData;
        }
    }

    /**
     * Refresh access token using refresh token
     * @param {string} platform - The social media platform
     * @param {string} refreshToken - OAuth refresh token
     * @param {string} clientId - OAuth client ID
     * @param {string} clientSecret - OAuth client secret
     * @returns {Promise<Object>} New token response
     */
    async refreshAccessToken(platform, refreshToken, clientId, clientSecret) {
        const platformConfig = this.platforms[platform];
        if (!platformConfig) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        const tokenData = {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        };

        let tokenUrl;
        switch (platform) {
            case 'google':
                tokenUrl = `${platformConfig.oauthBase}/oauth2/v4/token`;
                break;
            case 'microsoft':
                tokenUrl = `${platformConfig.oauthBase}/common/oauth2/v2.0/token`;
                break;
            case 'linkedin':
                tokenUrl = `${platformConfig.oauthBase}/oauth/v2/accessToken`;
                break;
            case 'instagram':
                tokenUrl = `${platformConfig.oauthBase}/oauth/access_token`;
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        try {
            const response = await axios.post(tokenUrl, tokenData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to refresh access token: ${error.message}`);
        }
    }

    /**
     * Validate access token
     * @param {string} platform - The social media platform
     * @param {string} accessToken - OAuth access token
     * @returns {Promise<boolean>} Whether token is valid
     */
    async validateToken(platform, accessToken) {
        try {
            await this.getUserProfile(platform, accessToken);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get supported platforms
     * @returns {Array} List of supported platforms
     */
    getSupportedPlatforms() {
        return Object.keys(this.platforms);
    }

    /**
     * Get platform configuration
     * @param {string} platform - The social media platform
     * @returns {Object} Platform configuration
     */
    getPlatformConfig(platform) {
        return this.platforms[platform];
    }
}

export default new SocialMediaService(); 