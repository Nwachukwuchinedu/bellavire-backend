import User from '../../models/User.js';
import Tenant from '../../models/Tenant.js';
import Landlord from '../../models/Landlord.js';
import Agent from '../../models/Agent.js';
import Property from '../../models/Property.js';
import Notification from '../../models/Notification.js';

export const getTotalUsers = async () => User.countDocuments();
export const getTotalTenants = async () => Tenant.countDocuments();
export const getTotalLandlords = async () => Landlord.countDocuments();
export const getTotalAgents = async () => Agent.countDocuments();
export const getAllProperties = async () => Property.find({});
export const getAdminNotifications = async (adminId) => Notification.find({ admin: adminId }).sort({ createdAt: -1 });

export const getRecentTenants = async (period = 'all') => {
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
    return Tenant.find(query).sort({ createdAt: -1 });
};
