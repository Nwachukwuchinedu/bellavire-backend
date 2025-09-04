import Landlord from "../../models/Landlord.js";
import User from "../../models/User.js";
import validator from "../../validation/dynamicValidateAndSanitize.js";
import bcrypt from "bcryptjs";

// Utility function to initialize settings for existing landlords
const initializeLandlordSettings = async (landlordId) => {
    const updateFields = {};
    
    // Check if any of the new fields are missing and initialize them
    const landlord = await Landlord.findById(landlordId);
    
    if (!landlord.accountSettings) {
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
    
    if (!landlord.bankSettings) {
        updateFields.bankSettings = {
            accounts: []
        };
    }
    
    if (!landlord.paymentSettings) {
        updateFields.paymentSettings = {
            autoRentCollection: false,
            defaultRentDueDate: 1,
            gracePeriod: 5,
            lateFeeSettings: {
                enabled: false,
                oneTimeFee: {
                    enabled: false,
                    amount: 0,
                    type: 'fixed'
                },
                dailyFee: {
                    enabled: false,
                    amount: 0,
                    type: 'fixed'
                }
            },
            recurringInvoiceSettings: {
                postingDays: 5
            }
        };
    }
    
    if (!landlord.accountingSettings) {
        updateFields.accountingSettings = {
            taxYear: '2024-2025',
            quickBooksSync: false,
            defaultExpenseCategories: []
        };
    }
    
    if (!landlord.rentalApplicationSettings) {
        updateFields.rentalApplicationSettings = {
            applicationFee: {
                enabled: false,
                amount: 0,
                currency: 'USD',
                refundable: false
            },
            onlineApplication: true,
            requireBackgroundCheck: true,
            requireIncomeVerification: true,
            customQuestions: []
        };
    }
    
    if (!landlord.notificationPreferences) {
        updateFields.notificationPreferences = {
            paymentReceived: true,
            failedPaymentAlerts: true,
            tenantDelayNotices: true,
            maintenanceUpdates: true,
            leaseExpirationReminders: true,
            applicationNotifications: true,
            emailDigest: {
                enabled: true,
                frequency: 'weekly'
            }
        };
    }
    
    if (!landlord.securitySettings) {
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
        await Landlord.findByIdAndUpdate(landlordId, { $set: updateFields });
    }
    
    return updateFields;
};

// ===== ACCOUNT SETTINGS =====

// Get account settings
export const getAccountSettings = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId })
            .select('accountSettings securitySettings');
        
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
            data: {
                accountSettings: landlord.accountSettings,
                securitySettings: landlord.securitySettings
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

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('accountSettings');

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
            data: landlord.accountSettings,
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
        await Landlord.findOneAndUpdate(
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

// Enable/Disable Two-Factor Authentication
export const updateTwoFactorAuth = async (req, res) => {
    try {
        const { enabled, method } = req.body;

        const updateData = {};
        if (enabled !== undefined) updateData['accountSettings.twoFactorAuthentication.enabled'] = enabled;
        if (method !== undefined) updateData['accountSettings.twoFactorAuthentication.method'] = method;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('accountSettings.twoFactorAuthentication');

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
            data: landlord.accountSettings.twoFactorAuthentication,
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

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('securitySettings');

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
            data: landlord.securitySettings,
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

// ===== BANK ACCOUNT SETTINGS =====

// Get bank accounts
export const getBankAccounts = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId })
            .select('bankSettings');

        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Return empty array if bankSettings doesn't exist or is not initialized
        const accounts = landlord.bankSettings?.accounts || [];

        res.json({
            status: true,
            data: accounts,
            message: "Bank accounts retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve bank accounts",
            error: err.message
        });
    }
};

// Add bank account
export const addBankAccount = async (req, res) => {
    try {
        const { bankName, accountNumber, accountType, isMain, currency } = req.body;

        if (!bankName || !accountNumber) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Bank name and account number are required",
                error: null
            });
        }

        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Initialize settings if they don't exist
        await initializeLandlordSettings(landlord._id);

        // If this is set as main account, unset all other main accounts
        if (isMain) {
            await Landlord.findOneAndUpdate(
                { user: req.user.userId },
                { $set: { "bankSettings.accounts.$[].isMain": false } }
            );
        }

        const newAccount = {
            bankName,
            accountNumber,
            accountType: accountType || 'checking',
            isMain: isMain || false,
            currency: currency || 'USD',
            isVerified: false,
            createdAt: new Date()
        };

        const updatedLandlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            { $push: { "bankSettings.accounts": newAccount } },
            { new: true, runValidators: true }
        ).select('bankSettings');

        res.json({
            status: true,
            data: updatedLandlord.bankSettings.accounts,
            message: "Bank account added successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to add bank account",
            error: err.message
        });
    }
};

// Update bank account
export const updateBankAccount = async (req, res) => {
    try {
        const { accountId } = req.params;
        const { bankName, accountType, isMain, currency } = req.body;

        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        const accountIndex = landlord.bankSettings?.accounts?.findIndex(
            acc => acc._id.toString() === accountId
        );

        if (accountIndex === -1) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Bank account not found",
                error: null
            });
        }

        // If setting as main, unset all other main accounts
        if (isMain) {
            await Landlord.findOneAndUpdate(
                { user: req.user.userId },
                { $set: { "bankSettings.accounts.$[].isMain": false } }
            );
        }

        const updateData = {};
        if (bankName !== undefined) updateData[`bankSettings.accounts.${accountIndex}.bankName`] = bankName;
        if (accountType !== undefined) updateData[`bankSettings.accounts.${accountIndex}.accountType`] = accountType;
        if (isMain !== undefined) updateData[`bankSettings.accounts.${accountIndex}.isMain`] = isMain;
        if (currency !== undefined) updateData[`bankSettings.accounts.${accountIndex}.currency`] = currency;

        const updatedLandlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('bankSettings');

        res.json({
            status: true,
            data: updatedLandlord.bankSettings.accounts,
            message: "Bank account updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update bank account",
            error: err.message
        });
    }
};

// Delete bank account
export const deleteBankAccount = async (req, res) => {
    try {
        const { accountId } = req.params;

        const updatedLandlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            { $pull: { "bankSettings.accounts": { _id: accountId } } },
            { new: true }
        ).select('bankSettings');

        if (!updatedLandlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: updatedLandlord.bankSettings.accounts,
            message: "Bank account deleted successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to delete bank account",
            error: err.message
        });
    }
};

// ===== PAYMENT SETTINGS =====

// Get payment settings
export const getPaymentSettings = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId })
            .select('paymentSettings');

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
            data: landlord.paymentSettings,
            message: "Payment settings retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve payment settings",
            error: err.message
        });
    }
};

// Update payment settings
export const updatePaymentSettings = async (req, res) => {
    try {
        const {
            autoRentCollection,
            defaultRentDueDate,
            gracePeriod,
            lateFeeSettings,
            recurringInvoiceSettings
        } = req.body;

        const updateData = {};
        if (autoRentCollection !== undefined) updateData['paymentSettings.autoRentCollection'] = autoRentCollection;
        if (defaultRentDueDate !== undefined) updateData['paymentSettings.defaultRentDueDate'] = defaultRentDueDate;
        if (gracePeriod !== undefined) updateData['paymentSettings.gracePeriod'] = gracePeriod;
        if (lateFeeSettings !== undefined) updateData['paymentSettings.lateFeeSettings'] = lateFeeSettings;
        if (recurringInvoiceSettings !== undefined) updateData['paymentSettings.recurringInvoiceSettings'] = recurringInvoiceSettings;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('paymentSettings');

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
            data: landlord.paymentSettings,
            message: "Payment settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update payment settings",
            error: err.message
        });
    }
};

// Update late fee settings
export const updateLateFeeSettings = async (req, res) => {
    try {
        const { enabled, oneTimeFee, dailyFee } = req.body;

        const updateData = {};
        if (enabled !== undefined) updateData['paymentSettings.lateFeeSettings.enabled'] = enabled;
        if (oneTimeFee !== undefined) updateData['paymentSettings.lateFeeSettings.oneTimeFee'] = oneTimeFee;
        if (dailyFee !== undefined) updateData['paymentSettings.lateFeeSettings.dailyFee'] = dailyFee;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('paymentSettings.lateFeeSettings');

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
            data: landlord.paymentSettings.lateFeeSettings,
            message: "Late fee settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update late fee settings",
            error: err.message
        });
    }
};

// ===== ACCOUNTING & TAX SETTINGS =====

// Get accounting settings
export const getAccountingSettings = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId })
            .select('accountingSettings');

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
            data: landlord.accountingSettings,
            message: "Accounting settings retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve accounting settings",
            error: err.message
        });
    }
};

// Update accounting settings
export const updateAccountingSettings = async (req, res) => {
    try {
        const { taxYear, quickBooksSync, defaultExpenseCategories } = req.body;

        const updateData = {};
        if (taxYear !== undefined) updateData['accountingSettings.taxYear'] = taxYear;
        if (quickBooksSync !== undefined) updateData['accountingSettings.quickBooksSync'] = quickBooksSync;
        if (defaultExpenseCategories !== undefined) updateData['accountingSettings.defaultExpenseCategories'] = defaultExpenseCategories;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('accountingSettings');

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
            data: landlord.accountingSettings,
            message: "Accounting settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update accounting settings",
            error: err.message
        });
    }
};

// Add expense category
export const addExpenseCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Category name is required",
                error: null
            });
        }

        const newCategory = {
            name,
            isActive: true
        };

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            { $push: { "accountingSettings.defaultExpenseCategories": newCategory } },
            { new: true, runValidators: true }
        ).select('accountingSettings.defaultExpenseCategories');

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
            data: landlord.accountingSettings.defaultExpenseCategories,
            message: "Expense category added successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to add expense category",
            error: err.message
        });
    }
};

// ===== RENTAL APPLICATION SETTINGS =====

// Get rental application settings
export const getRentalApplicationSettings = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId })
            .select('rentalApplicationSettings');

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
            data: landlord.rentalApplicationSettings,
            message: "Rental application settings retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve rental application settings",
            error: err.message
        });
    }
};

// Update rental application settings
export const updateRentalApplicationSettings = async (req, res) => {
    try {
        const {
            applicationFee,
            onlineApplication,
            requireBackgroundCheck,
            requireIncomeVerification,
            minimumCreditScore,
            customQuestions
        } = req.body;

        const updateData = {};
        if (applicationFee !== undefined) updateData['rentalApplicationSettings.applicationFee'] = applicationFee;
        if (onlineApplication !== undefined) updateData['rentalApplicationSettings.onlineApplication'] = onlineApplication;
        if (requireBackgroundCheck !== undefined) updateData['rentalApplicationSettings.requireBackgroundCheck'] = requireBackgroundCheck;
        if (requireIncomeVerification !== undefined) updateData['rentalApplicationSettings.requireIncomeVerification'] = requireIncomeVerification;
        if (minimumCreditScore !== undefined) updateData['rentalApplicationSettings.minimumCreditScore'] = minimumCreditScore;
        if (customQuestions !== undefined) updateData['rentalApplicationSettings.customQuestions'] = customQuestions;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('rentalApplicationSettings');

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
            data: landlord.rentalApplicationSettings,
            message: "Rental application settings updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update rental application settings",
            error: err.message
        });
    }
};

// Add custom question
export const addCustomQuestion = async (req, res) => {
    try {
        const { question, type, options, required } = req.body;

        if (!question || !type) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Question and type are required",
                error: null
            });
        }

        const newQuestion = {
            question,
            type,
            options: options || [],
            required: required || false
        };

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            { $push: { "rentalApplicationSettings.customQuestions": newQuestion } },
            { new: true, runValidators: true }
        ).select('rentalApplicationSettings.customQuestions');

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
            data: landlord.rentalApplicationSettings.customQuestions,
            message: "Custom question added successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to add custom question",
            error: err.message
        });
    }
};

// Delete custom question
export const deleteCustomQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            { $pull: { "rentalApplicationSettings.customQuestions": { _id: questionId } } },
            { new: true }
        ).select('rentalApplicationSettings.customQuestions');

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
            data: landlord.rentalApplicationSettings.customQuestions,
            message: "Custom question deleted successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to delete custom question",
            error: err.message
        });
    }
};

// ===== NOTIFICATION PREFERENCES =====

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
    try {
        const landlord = await Landlord.findOne({ user: req.user.userId })
            .select('notificationPreferences');

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
            data: landlord.notificationPreferences,
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
        const {
            paymentReceived,
            failedPaymentAlerts,
            tenantDelayNotices,
            maintenanceUpdates,
            leaseExpirationReminders,
            applicationNotifications,
            emailDigest
        } = req.body;

        const updateData = {};
        if (paymentReceived !== undefined) updateData['notificationPreferences.paymentReceived'] = paymentReceived;
        if (failedPaymentAlerts !== undefined) updateData['notificationPreferences.failedPaymentAlerts'] = failedPaymentAlerts;
        if (tenantDelayNotices !== undefined) updateData['notificationPreferences.tenantDelayNotices'] = tenantDelayNotices;
        if (maintenanceUpdates !== undefined) updateData['notificationPreferences.maintenanceUpdates'] = maintenanceUpdates;
        if (leaseExpirationReminders !== undefined) updateData['notificationPreferences.leaseExpirationReminders'] = leaseExpirationReminders;
        if (applicationNotifications !== undefined) updateData['notificationPreferences.applicationNotifications'] = applicationNotifications;
        if (emailDigest !== undefined) updateData['notificationPreferences.emailDigest'] = emailDigest;

        const landlord = await Landlord.findOneAndUpdate(
            { user: req.user.userId },
            updateData,
            { new: true, runValidators: true }
        ).select('notificationPreferences');

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
            data: landlord.notificationPreferences,
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

// ===== COMPREHENSIVE SETTINGS =====

// Get all settings
export const getAllSettings = async (req, res) => {
    try {
        let landlord = await Landlord.findOne({ user: req.user.userId })
            .select('accountSettings bankSettings paymentSettings accountingSettings rentalApplicationSettings notificationPreferences securitySettings');

        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Initialize missing settings for existing landlords
        await initializeLandlordSettings(landlord._id);
        
        // Refetch the landlord with updated settings
        landlord = await Landlord.findOne({ user: req.user.userId })
            .select('accountSettings bankSettings paymentSettings accountingSettings rentalApplicationSettings notificationPreferences securitySettings');

        res.json({
            status: true,
            data: {
                accountSettings: landlord.accountSettings,
                bankSettings: landlord.bankSettings,
                paymentSettings: landlord.paymentSettings,
                accountingSettings: landlord.accountingSettings,
                rentalApplicationSettings: landlord.rentalApplicationSettings,
                notificationPreferences: landlord.notificationPreferences,
                securitySettings: landlord.securitySettings
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