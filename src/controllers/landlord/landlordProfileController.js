import Landlord from "../../models/Landlord.js";
import validator from "../../validation/dynamicValidateAndSanitize.js";

// Get current landlord profile
export const getCurrentLandlord = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }
        res.json({
            status: true,
            data: landlord,
            message: "Landlord profile retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve landlord profile",
            error: err.message
        });
    }
};

// Update current landlord profile
export const updateLandlord = async (req, res) => {
    try {
        const { value, error } = validator.validateForUpdate(req.body, Landlord);
        if (error) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Validation failed",
                error: error.details
            });
        }
        
        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            value,
            { new: true, runValidators: true }
        );
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }
        
        res.json({
            status: true,
            data: landlord,
            message: "Landlord profile updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update landlord profile",
            error: err.message
        });
    }
};

// Get notification settings
export const getNotificationSettings = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId }).select('notificationSettings');
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }
        res.json({
            status: true,
            data: landlord.notificationSettings,
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
        const { value, error } = validator.validateForUpdate(req.body, Landlord, {
            includeFields: ['notificationSettings']
        });
        if (error) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Validation failed",
                error: error.details
            });
        }
        
        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            { notificationSettings: value.notificationSettings },
            { new: true, runValidators: true }
        ).select('notificationSettings');
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }
        
        res.json({
            status: true,
            data: landlord.notificationSettings,
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
