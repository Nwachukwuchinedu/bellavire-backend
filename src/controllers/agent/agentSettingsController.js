import Agent from "../../models/Agent.js";
import User from "../../models/User.js";
import validator from "../../validation/dynamicValidateAndSanitize.js";
import bcrypt from "bcryptjs";

// Utility function to initialize settings for existing agents
const initializeAgentSettings = async (agentId) => {
    const updateFields = {};
    
    // Check if any of the new fields are missing and initialize them
    const agent = await Agent.findById(agentId);
    
    if (!agent.accountSettings) {
        updateFields.accountSettings = {
            displayAsCompany: false,
            displayName: '',
            preferredCurrency: 'USD',
            twoFactorAuthentication: {
                enabled: false,
                method: 'email'
            }
        };
    }
    
    if (!agent.notificationPreferences) {
        updateFields.notificationPreferences = {
            newLeads: true,
            maintenanceUpdates: true,
            taskAssignments: true,
            paymentNotifications: true,
            communicationAlerts: true,
            emailDigest: {
                enabled: true,
                frequency: 'weekly'
            }
        };
    }
    
    if (!agent.securitySettings) {
        updateFields.securitySettings = {
            passwordLastChanged: null,
            loginNotifications: true,
            deviceTracking: true,
            sessionTimeout: 30,
            ipWhitelist: []
        };
    }
    
    // Apply updates if any fields are missing
    if (Object.keys(updateFields).length > 0) {
        await Agent.findByIdAndUpdate(agentId, { $set: updateFields });
    }
    
    return updateFields;
};

// ===== COMPREHENSIVE SETTINGS =====

// Get all settings
export const getAllSettings = async (req, res) => {
    try {
        const agent = await Agent.findOne({ user: req.user.userId })
            .select('accountSettings notificationPreferences securitySettings');
        
        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        // Initialize missing settings
        await initializeAgentSettings(agent._id);

        res.json({
            status: true,
            data: {
                accountSettings: agent.accountSettings,
                notificationPreferences: agent.notificationPreferences,
                securitySettings: agent.securitySettings
            },
            message: "All settings retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve settings",
            error: err.message
        });
    }
};

// ===== ACCOUNT SETTINGS =====

// Get account settings
export const getAccountSettings = async (req, res) => {
    try {
        const agent = await Agent.findOne({ user: req.user.userId })
            .select('accountSettings securitySettings');
        
        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: {
                accountSettings: agent.accountSettings,
                securitySettings: agent.securitySettings
            },
            message: "Account settings retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve account settings",
            error: err.message
        });
    }
};

// Update account settings
export const updateAccountSettings = async (req, res) => {
    try {
        const updateData = {};
        const { displayAsCompany, displayName, preferredCurrency } = req.body;

        if (displayAsCompany !== undefined) updateData['accountSettings.displayAsCompany'] = displayAsCompany;
        if (displayName !== undefined) updateData['accountSettings.displayName'] = displayName;
        if (preferredCurrency !== undefined) updateData['accountSettings.preferredCurrency'] = preferredCurrency;

        const agent = await Agent.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('accountSettings');

        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.accountSettings,
            message: "Account settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update account settings",
            error: err.message
        });
    }
};

// ===== SECURITY SETTINGS =====

// Update password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Current password and new password are required",
                error: null
            });
        }

        // Get user to verify current password
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "User not found",
                error: null
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Current password is incorrect",
                error: null
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password and security settings
        await User.findByIdAndUpdate(req.user.userId, { password: hashedPassword });
        await Agent.findOneAndUpdate(
            { user: req.user.userId },
            { 'securitySettings.passwordLastChanged': new Date() }
        );

        res.json({
            status: true,
            data: null,
            message: "Password updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update password",
            error: err.message
        });
    }
};

// Update two-factor authentication settings
export const updateTwoFactorAuth = async (req, res) => {
    try {
        const { enabled, method } = req.body;
        const updateData = {};

        if (enabled !== undefined) updateData['accountSettings.twoFactorAuthentication.enabled'] = enabled;
        if (method !== undefined) updateData['accountSettings.twoFactorAuthentication.method'] = method;

        const agent = await Agent.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('accountSettings.twoFactorAuthentication');

        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.accountSettings.twoFactorAuthentication,
            message: "Two-factor authentication settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update two-factor authentication settings",
            error: err.message
        });
    }
};

// Update security settings
export const updateSecuritySettings = async (req, res) => {
    try {
        const { loginNotifications, deviceTracking, sessionTimeout } = req.body;

        const updateData = {};
        if (loginNotifications !== undefined) updateData['securitySettings.loginNotifications'] = loginNotifications;
        if (deviceTracking !== undefined) updateData['securitySettings.deviceTracking'] = deviceTracking;
        if (sessionTimeout !== undefined) updateData['securitySettings.sessionTimeout'] = sessionTimeout;

        const agent = await Agent.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('securitySettings');

        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.securitySettings,
            message: "Security settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update security settings",
            error: err.message
        });
    }
};

// ===== NOTIFICATION SETTINGS =====

// Get notification settings
export const getNotificationSettings = async (req, res) => {
    try {
        const agent = await Agent.findOne({ user: req.user.userId })
            .select('notificationSettings');
        
        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.notificationSettings,
            message: "Notification settings retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve notification settings",
            error: err.message
        });
    }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
    try {
        const { notificationSettings } = req.body;

        if (!notificationSettings) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Notification settings are required",
                error: null
            });
        }

        // Construct the update object with dot notation for nested fields
        const updateData = {};
        for (const [category, settings] of Object.entries(notificationSettings)) {
            if (typeof settings === 'object' && settings !== null) {
                for (const [setting, value] of Object.entries(settings)) {
                    updateData[`notificationSettings.${category}.${setting}`] = value;
                }
            } else {
                updateData[`notificationSettings.${category}`] = settings;
            }
        }

        const agent = await Agent.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('notificationSettings');

        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.notificationSettings,
            message: "Notification settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update notification settings",
            error: err.message
        });
    }
};

// ===== NOTIFICATION PREFERENCES =====

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
    try {
        const agent = await Agent.findOne({ user: req.user.userId })
            .select('notificationPreferences');
        
        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.notificationPreferences,
            message: "Notification preferences retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve notification preferences",
            error: err.message
        });
    }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
    try {
        const updateData = {};
        const { 
            newLeads, 
            maintenanceUpdates, 
            taskAssignments, 
            paymentNotifications, 
            communicationAlerts,
            emailDigest 
        } = req.body;

        if (newLeads !== undefined) updateData['notificationPreferences.newLeads'] = newLeads;
        if (maintenanceUpdates !== undefined) updateData['notificationPreferences.maintenanceUpdates'] = maintenanceUpdates;
        if (taskAssignments !== undefined) updateData['notificationPreferences.taskAssignments'] = taskAssignments;
        if (paymentNotifications !== undefined) updateData['notificationPreferences.paymentNotifications'] = paymentNotifications;
        if (communicationAlerts !== undefined) updateData['notificationPreferences.communicationAlerts'] = communicationAlerts;
        
        if (emailDigest) {
            if (emailDigest.enabled !== undefined) updateData['notificationPreferences.emailDigest.enabled'] = emailDigest.enabled;
            if (emailDigest.frequency !== undefined) updateData['notificationPreferences.emailDigest.frequency'] = emailDigest.frequency;
        }

        const agent = await Agent.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('notificationPreferences');

        if (!agent) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Agent not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: agent.notificationPreferences,
            message: "Notification preferences updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update notification preferences",
            error: err.message
        });
    }
};