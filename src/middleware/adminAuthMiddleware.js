import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig.js';
import Admin from '../models/Admin.js';

/**
 * Middleware to authenticate admin JWT tokens
 */
export const authenticateAdminToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.JWT_ACCESS_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Check if token contains adminId (admin token)
        if (!decoded.adminId) {
            return res.status(401).json({ error: 'Invalid admin token' });
        }

        // Find admin by decoded.adminId
        const admin = await Admin.findById(decoded.adminId).select('-password');
        if (!admin) {
            return res.status(401).json({ error: 'Admin not found' });
        }

        req.admin = {
            adminId: admin._id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName
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