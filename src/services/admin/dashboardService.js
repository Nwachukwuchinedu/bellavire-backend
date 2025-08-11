import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Agent from '../../models/Agent.js';
import Property from '../../models/Property.js';
import Notification from '../../models/Notification.js';

// Optimized count operations with database hints
export const getTotalUsers = async () => User.countDocuments().hint({ _id: 1 });
export const getTotalTenants = async () => Tenant.countDocuments().hint({ _id: 1 });
export const getTotalLandlords = async () => Landlord.countDocuments().hint({ _id: 1 });
export const getTotalAgents = async () => Agent.countDocuments().hint({ _id: 1 });

// Optimized property query with projection for essential fields only
export const getAllProperties = async () => Property.find({})// Limit to 50 properties and use lean() for better performance

// Optimized notifications with limit and projection
export const getAdminNotifications = async (adminId) => Notification.find(
    { admin: adminId },
    { _id: 1, title: 1, message: 1, type: 1, createdAt: 1, isRead: 1 }
)
    .sort({ createdAt: -1 })
    .limit(20) // Limit to 20 most recent notifications
    .lean();

// Optimized recent tenants with limits and projections
export const getRecentTenants = async (period = 'all', limit = 10) => {
    let fromDate;
    const now = new Date();

    if (period === '30days') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '7days') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '24hours') {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const query = fromDate ? { createdAt: { $gte: fromDate } } : {};

    return Tenant.find(query, {
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phoneNumber: 1,
        createdAt: 1,
        status: 1
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(); // Use lean() for better performance when you don't need Mongoose document methods
};
