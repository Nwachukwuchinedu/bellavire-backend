import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig.js';
import User from '../models/User.js';
import axios from 'axios';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Try to decode as JWT first (for local users)
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.JWT_ACCESS_SECRET);
        } catch (jwtError) {
            // If JWT fails, try Google token verification
            // Find user by Google access token (not ideal, but we need to check)
            try {
                // Verify Google access token
                const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
                const googleEmail = googleRes.data.email;
                if (!googleEmail) {
                    return res.status(401).json({ error: 'Invalid Google access token' });
                }
                // Find user by email and authProvider
                const user = await User.findOne({ email: googleEmail, authProvider: 'google' }).select('-password');
                if (!user) {
                    return res.status(401).json({ error: 'Google user not found' });
                }
                if (!user.isActive) {
                    return res.status(401).json({ error: 'User account is deactivated' });
                }
                req.user = {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    authProvider: user.authProvider
                };
                return next();
            } catch (googleError) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        }

        // If JWT is valid, find user by decoded.userId
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (!user.isActive) {
            return res.status(401).json({ error: 'User account is deactivated' });
        }
        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            isEmailVerified: user.isEmailVerified
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication error' });
    }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is landlord
 */
export const requireLandlord = requireRole(['landlord']);

/**
 * Middleware to check if user is tenant
 */
export const requireTenant = requireRole(['tenant']);

/**
 * Middleware to check if user is agent
 */
export const requireAgent = requireRole(['agent']);