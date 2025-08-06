import Landlord from "../models/Landlord.js";
import Property from "../models/Property.js";
import Room from "../models/Room.js";
import Maintenance from "../models/Maintenance.js";
import Contractor from "../models/Contractor.js";
import Lease from "../models/Lease.js";
import TenantPayment from "../models/TenantPayment.js";
import Tour from "../models/Tour.js";
import Notification from "../models/Notification.js";
import TenantApplication from "../models/TenantApplication.js";
import RentalHistory from "../models/RentalHistory.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import validator from "../validation/dynamicValidateAndSanitize.js";
import { uploads } from "../utils/fileUtils.js";
import { sendEmail } from "../services/emailService.js";
import { createTourNotificationEmail } from "../templates/tourNotification.js";
import { createNotification, sendEmailNotification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } from "../services/notificationService.js";
import { createMaintenanceNotificationEmail } from "../templates/tenantNotification.js";
import { createMaintenanceNotificationEmail as createLandlordMaintenanceEmail } from "../templates/landlordNotification.js";
import { createApplicationApprovedEmail, createApplicationCancelledEmail } from "../templates/applicationNotification.js";

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

// Get all properties with summary
export const getAllProperties = async (req, res) => {
    try {
        // Get landlord first to ensure they exist
        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Get all properties for this landlord
        const properties = await Property.find({ landlord: landlord._id });

        // Calculate summary statistics
        const summary = {
            totalProperties: properties.length,
            totalRooms: properties.reduce((sum, property) => sum + property.bedrooms, 0),
            occupiedRooms: 0, // This would need to be calculated based on active leases
            vacantRooms: 0,   // This would need to be calculated based on active leases
            totalMonthlyRent: properties.reduce((sum, property) => sum + property.monthlyRent, 0),
            averageMonthlyRent: properties.length > 0 ? 
                properties.reduce((sum, property) => sum + property.monthlyRent, 0) / properties.length : 0
        };

        // For now, we'll set occupied and vacant based on a simple calculation
        // In a real app, this would be based on active leases
        summary.vacantRooms = summary.totalRooms;
        summary.occupiedRooms = 0;

        res.json({
            status: true,
            data: {
                properties,
                summary
            },
            message: "Properties retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve properties",
            error: err.message
        });
    }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get landlord first to ensure they exist
        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        const property = await Property.findOne({ 
            _id: id, 
            landlord: landlord._id 
        });

        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: property,
            message: "Property retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve property",
            error: err.message
        });
    }
};

// Create new property
export const createProperty = async (req, res) => {
    try {
        // Get landlord first to ensure they exist
        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Handle file uploads
        const imagePaths = [];
        
        // Handle front image
        let frontImagePath = '';
        if (req.files && req.files.frontImage) {
            try {
                const fileInfo = await uploads(req.files.frontImage[0].buffer, req.files.frontImage[0].originalname, 'property');
                frontImagePath = fileInfo.path;
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: `Failed to upload front image: ${error.message}`,
                    error: error.message
                });
            }
        }

        // Handle property images
        if (req.files && req.files.propertyImages) {
            for (const file of req.files.propertyImages) {
                try {
                    const fileInfo = await uploads(file.buffer, file.originalname, 'property');
                    imagePaths.push(fileInfo.path);
                } catch (error) {
                    return res.status(400).json({
                        status: false,
                        data: null,
                        message: `Failed to upload property image ${file.originalname}: ${error.message}`,
                        error: error.message
                    });
                }
            }
        }

        // Create a completely clean property data object
        const propertyData = {
            landlord: landlord._id,
            propertyName: req.body.propertyName,
            propertyType: Array.isArray(req.body.propertyType) ? req.body.propertyType : [req.body.propertyType],
            address: req.body.address,
            frontImage: frontImagePath,
            propertyImages: imagePaths,
            description: req.body.description,
            bedrooms: parseInt(req.body.bedrooms),
            bathrooms: parseInt(req.body.bathrooms),
            furnished: req.body.furnished === 'true',
            amenities: {
                wifi: req.body.wifi === 'true',
                electricity: req.body.electricity === 'true',
                furnishedKitchen: req.body.furnishedKitchen === 'true',
                water: req.body.water === 'true',
                gym: req.body.gym === 'true'
            },
            sharedAreas: req.body.sharedAreas ? (Array.isArray(req.body.sharedAreas) ? req.body.sharedAreas : [req.body.sharedAreas]) : [],
            billsIncluded: req.body.billsIncluded ? (Array.isArray(req.body.billsIncluded) ? req.body.billsIncluded : [req.body.billsIncluded]) : [],
            monthlyRent: parseFloat(req.body.monthlyRent),
            depositAmount: parseFloat(req.body.depositAmount),
            tenancy: req.body.tenancy,
            availableFrom: new Date(req.body.availableFrom),
            paymentFrequency: req.body.paymentFrequency,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2 || undefined,
            cityOrTown: req.body.cityOrTown,
            postalCode: req.body.postalCode,
            regionOrCountry: req.body.regionOrCountry
        };

        // Clear validator cache and create clean data for validation
        validator.schemaCache.clear();
        const cleanDataForValidation = JSON.parse(JSON.stringify(propertyData));
        
        // Validate the data
        const { value, error } = validator.validateForCreate(cleanDataForValidation, Property);
        if (error) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Validation failed",
                error: error.details
            });
        }

        const property = new Property(value);
        await property.save();

        res.status(201).json({
            status: true,
            data: property,
            message: "Property created successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to create property",
            error: err.message
        });
    }
};

// Update property
export const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Get landlord first to ensure they exist
        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Check if property exists and belongs to landlord
        const existingProperty = await Property.findOne({ 
            _id: id, 
            landlord: landlord._id 
        });

        if (!existingProperty) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found",
                error: null
            });
        }

        // Handle file uploads
        let frontImagePath = existingProperty.frontImage;
        let imagePaths = [...existingProperty.propertyImages];

        // Handle front image update
        if (req.files && req.files.frontImage) {
            try {
                const fileInfo = await uploads(req.files.frontImage[0].buffer, req.files.frontImage[0].originalname, 'property');
                frontImagePath = fileInfo.path;
            } catch (error) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: `Failed to upload front image: ${error.message}`,
                    error: error.message
                });
            }
        }

        // Handle property images update
        if (req.files && req.files.propertyImages) {
            for (const file of req.files.propertyImages) {
                try {
                    const fileInfo = await uploads(file.buffer, file.originalname, 'property');
                    imagePaths.push(fileInfo.path);
                } catch (error) {
                    return res.status(400).json({
                        status: false,
                        data: null,
                        message: `Failed to upload property image ${file.originalname}: ${error.message}`,
                        error: error.message
                    });
                }
            }
        }

        // Prepare update data - simple and direct approach
        const updateData = {};
        
        // Only add fields that are provided
        if (req.body.propertyName) updateData.propertyName = req.body.propertyName;
        if (req.body.address) updateData.address = req.body.address;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.bedrooms) updateData.bedrooms = parseInt(req.body.bedrooms);
        if (req.body.bathrooms) updateData.bathrooms = parseInt(req.body.bathrooms);
        if (req.body.furnished !== undefined) updateData.furnished = req.body.furnished === 'true';
        if (req.body.monthlyRent) updateData.monthlyRent = parseFloat(req.body.monthlyRent);
        if (req.body.depositAmount) updateData.depositAmount = parseFloat(req.body.depositAmount);
        if (req.body.tenancy) updateData.tenancy = req.body.tenancy;
        if (req.body.paymentFrequency) updateData.paymentFrequency = req.body.paymentFrequency;
        if (req.body.availableFrom) updateData.availableFrom = new Date(req.body.availableFrom);
        if (req.body.addressLine1) updateData.addressLine1 = req.body.addressLine1;
        if (req.body.addressLine2 !== undefined) updateData.addressLine2 = req.body.addressLine2 || undefined;
        if (req.body.cityOrTown) updateData.cityOrTown = req.body.cityOrTown;
        if (req.body.postalCode) updateData.postalCode = req.body.postalCode;
        if (req.body.regionOrCountry) updateData.regionOrCountry = req.body.regionOrCountry;
        
        // Arrays
        if (req.body.propertyType) {
            updateData.propertyType = Array.isArray(req.body.propertyType) ? req.body.propertyType : [req.body.propertyType];
        }
        if (req.body.sharedAreas) {
            updateData.sharedAreas = Array.isArray(req.body.sharedAreas) ? req.body.sharedAreas : [req.body.sharedAreas];
        }
        if (req.body.billsIncluded) {
            updateData.billsIncluded = Array.isArray(req.body.billsIncluded) ? req.body.billsIncluded : [req.body.billsIncluded];
        }
        
        // Amenities
        if (req.body.wifi !== undefined || req.body.electricity !== undefined || req.body.furnishedKitchen !== undefined || req.body.water !== undefined || req.body.gym !== undefined) {
            updateData.amenities = {
                wifi: req.body.wifi === 'true',
                electricity: req.body.electricity === 'true',
                furnishedKitchen: req.body.furnishedKitchen === 'true',
                water: req.body.water === 'true',
                gym: req.body.gym === 'true'
            };
        }
        
        // Files
        updateData.frontImage = frontImagePath;
        updateData.propertyImages = imagePaths;

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // Clear validator cache and create clean data for validation
        validator.schemaCache.clear();
        const cleanDataForValidation = JSON.parse(JSON.stringify(updateData));

        // Validate the data
        const { value, error } = validator.validateForUpdate(cleanDataForValidation, Property);
        if (error) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Validation failed",
                error: error.details
            });
        }

        const property = await Property.findByIdAndUpdate(
            id,
            value,
            { new: true, runValidators: true }
        );

        res.json({
            status: true,
            data: property,
            message: "Property updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update property",
            error: err.message
        });
    }
};

// Delete property
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Get landlord first to ensure they exist
        const landlord = await Landlord.findOne({ user: req.user.userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Check if property exists and belongs to landlord
        const property = await Property.findOne({ 
            _id: id, 
            landlord: landlord._id 
        });

        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found",
                error: null
            });
        }

        await Property.findByIdAndDelete(id);

        res.json({
            status: true,
            data: null,
            message: "Property deleted successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to delete property",
            error: err.message
        });
    }
};

// Search properties with filters
export const searchProperties = async (req, res) => {
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

        // Extract query parameters
        const { search, minRent, maxRent, occupation, date } = req.query;

        // Build filter object
        const filter = { landlord: landlord._id };

        // Search term filter
        if (search) {
            filter.$or = [
                { propertyName: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { cityOrTown: { $regex: search, $options: 'i' } },
                { postalCode: { $regex: search, $options: 'i' } }
            ];
        }

        // Rent range filter
        if (minRent || maxRent) {
            filter.monthlyRent = {};
            if (minRent) filter.monthlyRent.$gte = parseFloat(minRent);
            if (maxRent) filter.monthlyRent.$lte = parseFloat(maxRent);
        }

        // Date filter
        if (date) {
            filter.availableFrom = { $gte: new Date(date) };
        }

        // Occupation filter (this would need to be implemented based on your business logic)
        // For now, we'll skip this as it requires checking tenant occupancy
        if (occupation && occupation !== 'all') {
            // This would need to be implemented based on how you track occupancy
            // For example, checking if there are active leases for the property
        }

        // Execute query
        const properties = await Property.find(filter).sort({ createdAt: -1 });

        res.json({
            status: true,
            data: properties,
            message: "Properties retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve properties",
            error: err.message
        });
    }
};

// Get all maintenance requests for the landlord with summary statistics
export const getAllMaintenances = async (req, res) => {
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

        // Get all maintenance requests for this landlord
        const maintenances = await Maintenance.find({ landlordId: landlord._id })
            .populate('tenant', 'firstName lastName email phoneNumber')
            .populate('propertyId', 'propertyName address')
            .populate('contractor.contractorId', 'name email phone specialty')
            .sort({ createdAt: -1 });

        // Transform the data to include flattened fields
        const transformedMaintenances = maintenances.map(maintenance => ({
            _id: maintenance._id,
            issue: maintenance.issue,
            category: maintenance.category,
            status: maintenance.status,
            images: maintenance.images,
            description: maintenance.description,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
            __v: maintenance.__v,
            // Add the flattened fields
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null,
            propertyName: maintenance.propertyId ? 
                maintenance.propertyId.propertyName : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null
        }));

        // Calculate summary statistics
        const totalRequests = maintenances.length;
        const requestsInProgress = maintenances.filter(m => m.status === 'in progress').length;
        const pendingRequests = maintenances.filter(m => m.status === 'pending').length;
        const completedRequests = maintenances.filter(m => m.status === 'resolved').length;

        const summary = {
            totalRequests,
            requestsInProgress,
            pendingRequests,
            completedRequests
        };

        res.json({
            status: true,
            data: {
                maintenances: transformedMaintenances,
                summary
            },
            message: "Maintenance requests retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve maintenance requests",
            error: err.message
        });
    }
};

// Get a specific maintenance request by ID
export const getMaintenanceById = async (req, res) => {
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

        const maintenance = await Maintenance.findOne({
            _id: req.params.id,
            landlordId: landlord._id
        })
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'propertyName address')
        .populate('contractor.contractorId', 'name email phone specialty');

        if (!maintenance) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Maintenance request not found",
                error: null
            });
        }

        // Transform the data to include flattened fields
        const transformedMaintenance = {
            _id: maintenance._id,
            issue: maintenance.issue,
            category: maintenance.category,
            status: maintenance.status,
            images: maintenance.images,
            description: maintenance.description,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
            __v: maintenance.__v,
            // Add the flattened fields
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null,
            propertyName: maintenance.propertyId ? 
                maintenance.propertyId.propertyName : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null
        };

        res.json({
            status: true,
            data: transformedMaintenance,
            message: "Maintenance request retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve maintenance request",
            error: err.message
        });
    }
};

// Update maintenance request status
export const updateMaintenanceStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        const validStatuses = ['resolved', 'in progress', 'pending', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Invalid status. Must be one of: resolved, in progress, pending, failed",
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

        const maintenance = await Maintenance.findOneAndUpdate(
            {
                _id: req.params.id,
                landlordId: landlord._id
            },
            { status },
            { new: true }
        )
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'propertyName address')
        .populate('contractor.contractorId', 'name email phone specialty');

        if (!maintenance) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Maintenance request not found",
                error: null
            });
        }

        // Create notification for tenant about status update
        try {
            await createNotification({
                recipientId: maintenance.tenant._id,
                userRole: 'tenant',
                type: 'maintenance_status_updated',
                message: `Your maintenance request for "${maintenance.issue}" has been updated to ${status}.`,
                link: `/maintenances/${maintenance._id}`
            });

            // Send email notification if tenant has email notifications enabled
            const emailTemplate = createMaintenanceNotificationEmail('status_updated', {
                issue: maintenance.issue,
                category: maintenance.category,
                status: maintenance.status,
                propertyAddress: maintenance.propertyId?.address || 'N/A',
                landlordName: `${landlord.firstName} ${landlord.lastName}`
            });

            await sendEmailNotification({
                recipientId: maintenance.tenant._id,
                userRole: 'tenant',
                notificationType: 'maintenanceUpdates',
                subject: emailTemplate.subject,
                htmlContent: emailTemplate.html
            });
        } catch (notificationError) {
            console.error('Error creating maintenance status notification:', notificationError);
            // Don't fail the request if notification fails
        }

        // Transform the data to include flattened fields
        const transformedMaintenance = {
            _id: maintenance._id,
            issue: maintenance.issue,
            category: maintenance.category,
            status: maintenance.status,
            images: maintenance.images,
            description: maintenance.description,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
            __v: maintenance.__v,
            // Add the flattened fields
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null,
            propertyName: maintenance.propertyId ? 
                maintenance.propertyId.propertyName : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null
        };

        res.json({
            status: true,
            data: transformedMaintenance,
            message: "Maintenance request status updated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update maintenance request status",
            error: err.message
        });
    }
};

// Assign contractor to maintenance request
export const assignContractor = async (req, res) => {
    try {
        const { name, email, phone, specialty } = req.body;

        // Validate required contractor data
        if (!name || !email || !phone || !specialty) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Contractor name, email, phone, and specialty are required",
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

        // Check if contractor already exists with this email
        let contractor = await Contractor.findOne({ email });
        if (!contractor) {
            // Create new contractor
            contractor = new Contractor({
                name,
                email,
                phone,
                specialty,
                availability: 'available'
            });
            await contractor.save();
        }

        const maintenance = await Maintenance.findOneAndUpdate(
            {
                _id: req.params.id,
                landlordId: landlord._id
            },
            {
                'contractor.contractorId': contractor._id,
                'contractor.assignedAt': new Date()
            },
            { new: true }
        )
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'propertyName address')
        .populate('contractor.contractorId', 'name email phone specialty');

        if (!maintenance) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Maintenance request not found",
                error: null
            });
        }

        // Create notification for tenant about contractor assignment
        try {
            await createNotification({
                recipientId: maintenance.tenant._id,
                userRole: 'tenant',
                type: 'maintenance_contractor_assigned',
                message: `A contractor has been assigned to your maintenance request for "${maintenance.issue}".`,
                link: `/maintenances/${maintenance._id}`
            });

            // Send email notification if tenant has email notifications enabled
            const emailTemplate = createMaintenanceNotificationEmail('contractor_assigned', {
                issue: maintenance.issue,
                category: maintenance.category,
                status: maintenance.status,
                propertyAddress: maintenance.propertyId?.address || 'N/A',
                landlordName: `${landlord.firstName} ${landlord.lastName}`
            });

            await sendEmailNotification({
                recipientId: maintenance.tenant._id,
                userRole: 'tenant',
                notificationType: 'maintenanceUpdates',
                subject: emailTemplate.subject,
                htmlContent: emailTemplate.html
            });
        } catch (notificationError) {
            console.error('Error creating contractor assignment notification:', notificationError);
            // Don't fail the request if notification fails
        }

        // Transform the data to include flattened fields
        const transformedMaintenance = {
            _id: maintenance._id,
            issue: maintenance.issue,
            category: maintenance.category,
            status: maintenance.status,
            images: maintenance.images,
            description: maintenance.description,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
            __v: maintenance.__v,
            // Add the flattened fields
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null,
            propertyName: maintenance.propertyId ? 
                maintenance.propertyId.propertyName : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null
        };

        res.json({
            status: true,
            data: transformedMaintenance,
            message: "Contractor assigned successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to assign contractor",
            error: err.message
        });
    }
};

// Remove contractor assignment from maintenance request
export const removeContractor = async (req, res) => {
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

        const maintenance = await Maintenance.findOneAndUpdate(
            {
                _id: req.params.id,
                landlordId: landlord._id
            },
            {
                'contractor.contractorId': null,
                'contractor.assignedAt': null
            },
            { new: true }
        )
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'propertyName address')
        .populate('contractor.contractorId', 'name email phone specialty');

        if (!maintenance) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Maintenance request not found",
                error: null
            });
        }

        // Transform the data to include flattened fields
        const transformedMaintenance = {
            _id: maintenance._id,
            issue: maintenance.issue,
            category: maintenance.category,
            status: maintenance.status,
            images: maintenance.images,
            description: maintenance.description,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
            __v: maintenance.__v,
            // Add the flattened fields
            tenantName: maintenance.tenant ? 
                `${maintenance.tenant.firstName} ${maintenance.tenant.lastName}` : null,
            tenantPhoneNumber: maintenance.tenant ? 
                maintenance.tenant.phoneNumber : null,
            tenantEmail: maintenance.tenant ? 
                maintenance.tenant.email : null,
            propertyName: maintenance.propertyId ? 
                maintenance.propertyId.propertyName : null,
            propertyAddress: maintenance.propertyId ? 
                maintenance.propertyId.address : null
        };

        res.json({
            status: true,
            data: transformedMaintenance,
            message: "Contractor removed successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to remove contractor",
            error: err.message
        });
    }
};

// Get all leases for the landlord
export const getAllLeases = async (req, res) => {
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

        const leases = await Lease.find({ landlordId: landlord._id })
            .populate('tenantId', 'firstName lastName')
            .sort({ createdAt: -1 });

        // Transform leases to include minimal detail objects
        const transformedLeases = leases.map(lease => {
            const leaseObj = lease.toObject();
            
            // Add minimal tenant info (just ID and name)
            leaseObj.tenantInfo = lease.tenantId && typeof lease.tenantId === 'object' ? {
                id: lease.tenantId._id,
                name: `${lease.tenantId.firstName || ''} ${lease.tenantId.lastName || ''}`.trim()
            } : null;

            // Remove redundant tenantId field from the response
            delete leaseObj.tenantId;

            return leaseObj;
        });

        res.json({
            status: true,
            data: transformedLeases,
            message: "Leases retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve leases",
            error: err.message
        });
    }
};

// Get a specific lease by ID with detailed information
export const getLeaseById = async (req, res) => {
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

        const lease = await Lease.findOne({
            _id: req.params.id,
            landlordId: landlord._id
        })
        .populate('tenantId', 'firstName lastName email phoneNumber address country city employmentStatus monthlyIncome')
        .populate('propertyId', 'propertyName address monthlyRent depositAmount propertyType bedrooms bathrooms')
        .populate('landlordId', 'firstName lastName email phoneNumber address');

        if (!lease) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Lease not found",
                error: null
            });
        }

        // Debug logging
        console.log('Lease found:', {
            leaseId: lease._id,
            tenantId: lease.tenantId ? lease.tenantId._id : 'null',
            propertyId: lease.propertyId ? lease.propertyId._id : 'null',
            landlordId: lease.landlordId ? lease.landlordId._id : 'null'
        });

        // Get payment history for this tenant and property (only if both tenant and property exist)
        let paymentHistory = [];
        if (lease.tenantId && lease.propertyId) {
            try {
                paymentHistory = await TenantPayment.find({
                    tenant: lease.tenantId._id,
                    'receipt.property': lease.propertyId._id
                })
                .select('description amount dueDate transactionId status paymentMethod receipt')
                .sort({ createdAt: -1 });
            } catch (paymentError) {
                console.error('Error fetching payment history:', paymentError);
                // Continue without payment history if there's an error
                paymentHistory = [];
            }
        }

        // Transform lease to include populated detail objects
        const leaseObj = lease.toObject();
        
        // Create populated detail objects with safe property access
        leaseObj.tenantDetail = lease.tenantId && typeof lease.tenantId === 'object' ? {
            id: lease.tenantId._id,
            firstName: lease.tenantId.firstName || '',
            lastName: lease.tenantId.lastName || '',
            email: lease.tenantId.email || '',
            phoneNumber: lease.tenantId.phoneNumber || '',
            address: lease.tenantId.address || '',
            country: lease.tenantId.country || '',
            city: lease.tenantId.city || '',
            employmentStatus: lease.tenantId.employmentStatus || '',
            monthlyIncome: lease.tenantId.monthlyIncome || 0,
            paymentHistory: paymentHistory
        } : null;

        leaseObj.propertyDetail = lease.propertyId && typeof lease.propertyId === 'object' ? {
            id: lease.propertyId._id,
            propertyName: lease.propertyId.propertyName || '',
            address: lease.propertyId.address || '',
            monthlyRent: lease.propertyId.monthlyRent || 0,
            depositAmount: lease.propertyId.depositAmount || 0,
            propertyType: lease.propertyId.propertyType || [],
            bedrooms: lease.propertyId.bedrooms || 0,
            bathrooms: lease.propertyId.bathrooms || 0
        } : null;

        leaseObj.landlordDetail = lease.landlordId && typeof lease.landlordId === 'object' ? {
            id: lease.landlordId._id,
            firstName: lease.landlordId.firstName || '',
            lastName: lease.landlordId.lastName || '',
            email: lease.landlordId.email || '',
            phoneNumber: lease.landlordId.phoneNumber || '',
            address: lease.landlordId.address || ''
        } : null;

        // Remove redundant fields from the response
        delete leaseObj.tenantId;
        delete leaseObj.landlordId;
        delete leaseObj.propertyId;

        res.json({
            status: true,
            data: leaseObj,
            message: "Lease retrieved successfully",
            error: null
        });
    } catch (err) {
        console.error('Error in getLeaseById:', err);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve lease",
            error: err.message
        });
    }
};

// Terminate a lease
export const terminateLease = async (req, res) => {
    try {
        const { reason, comment } = req.body;

        if (!reason) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Reason for termination is required",
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

        const lease = await Lease.findOneAndUpdate(
            {
                _id: req.params.id,
                landlordId: landlord._id
            },
            {
                isTerminated: true,
                status: 'inactive',
                termination: {
                    reason,
                    comment: comment || '',
                    terminatedAt: new Date()
                }
            },
            { new: true }
        )
        .populate('tenantId', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'propertyName address monthlyRent')
        .populate('landlordId', 'firstName lastName email phoneNumber');

        if (!lease) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Lease not found",
                error: null
            });
        }

        // Transform lease to include populated detail objects
        const leaseObj = lease.toObject();
        
        // Create populated detail objects
        leaseObj.tenantDetail = lease.tenantId ? {
            id: lease.tenantId._id,
            firstName: lease.tenantId.firstName,
            lastName: lease.tenantId.lastName,
            email: lease.tenantId.email,
            phoneNumber: lease.tenantId.phoneNumber
        } : null;

        leaseObj.propertyDetail = lease.propertyId ? {
            id: lease.propertyId._id,
            propertyName: lease.propertyId.propertyName,
            address: lease.propertyId.address,
            monthlyRent: lease.propertyId.monthlyRent
        } : null;

        leaseObj.landlordDetail = lease.landlordId ? {
            id: lease.landlordId._id,
            firstName: lease.landlordId.firstName,
            lastName: lease.landlordId.lastName,
            email: lease.landlordId.email,
            phoneNumber: lease.landlordId.phoneNumber
        } : null;

        // Create rental history record when lease is terminated by landlord
        try {
            // Get tenant information
            const tenant = await Tenant.findById(lease.tenantId);
            if (tenant) {
                // Create rental history record
                const rentalHistory = new RentalHistory({
                    tenant: tenant.user, // Use the user ID from tenant
                    previousLandlord: `${lease.landlordId.firstName} ${lease.landlordId.lastName}`,
                    rentalDates: {
                        startDate: lease.startDate,
                        endDate: lease.expirationDate
                    },
                    reasonForLeaving: reason,
                    rentAmount: lease.rent,
                    propertyAddress: `${lease.streetName}, ${lease.city}, ${lease.zipCode}`
                });
                await rentalHistory.save();

                console.log(`Rental history created for lease terminated by landlord: ${lease._id}`);
            }
        } catch (rentalHistoryError) {
            console.error('Error creating rental history for lease terminated by landlord:', rentalHistoryError);
            // Don't fail the lease termination if rental history creation fails
        }

        res.json({
            status: true,
            data: leaseObj,
            message: "Lease terminated successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to terminate lease",
            error: err.message
        });
    }
}; 

// ==================== TOUR FUNCTIONS ====================

// Get landlord's tours
export const getMyTours = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { status, dateFrom, dateTo } = req.query;

        // Find landlord record using user ID
        const landlord = await Landlord.findOne({ user: userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Landlord profile not found',
                error: 'Landlord not found'
            });
        }

        const query = { landlord: landlord._id };
        
        // Apply filters
        if (status) {
            query.status = status;
        }
        if (dateFrom) {
            query.date = { $gte: new Date(dateFrom) };
        }
        if (dateTo) {
            query.date = { ...query.date, $lte: new Date(dateTo) };
        }

        const tours = await Tour.find(query)
            .populate('property', 'propertyName address frontImage')
            .populate('tenant', 'firstName lastName email phoneNumber')
            .populate('landlord', 'firstName lastName email phoneNumber')
            .sort({ date: 1, timeSlot: 1 });

        return res.status(200).json({
            status: true,
            data: tours,
            message: 'Tours retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get tour by ID
export const getTourById = async (req, res) => {
    try {
        const { tourId } = req.params;
        const userId = req.user.userId;

        // Find landlord record using user ID
        const landlord = await Landlord.findOne({ user: userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Landlord profile not found',
                error: 'Landlord not found'
            });
        }

        const tour = await Tour.findById(tourId)
            .populate('property', 'propertyName address frontImage monthlyRent')
            .populate('tenant', 'firstName lastName email phoneNumber')
            .populate('landlord', 'firstName lastName email phoneNumber');

        if (!tour) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tour not found',
                error: 'Tour not found'
            });
        }

        // Check if landlord has permission to view this tour
        if (tour.landlord.toString() !== landlord._id.toString()) {
            return res.status(403).json({
                status: false,
                data: null,
                message: 'Unauthorized access - You can only access your own tours',
                error: 'Unauthorized'
            });
        }

        return res.status(200).json({
            status: true,
            data: tour,
            message: 'Tour retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update tour status (confirm, decline, complete)
export const updateTourStatus = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { status, notes } = req.body;
        const userId = req.user.userId;

        // Find landlord record using user ID
        const landlord = await Landlord.findOne({ user: userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Landlord profile not found',
                error: 'Landlord not found'
            });
        }

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'declined', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Invalid status',
                error: 'Status must be one of: pending, confirmed, declined, cancelled, completed'
            });
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tour not found',
                error: 'Tour not found'
            });
        }

        // Check if landlord has permission to update this tour
        if (tour.landlord.toString() !== landlord._id.toString()) {
            return res.status(403).json({
                status: false,
                data: null,
                message: 'Unauthorized access - You can only update your own tours',
                error: 'Unauthorized'
            });
        }

        // Validate status transitions
        const validTransitions = {
            pending: ['confirmed', 'declined', 'cancelled'],
            confirmed: ['cancelled', 'completed'],
            declined: [],
            cancelled: [],
            completed: []
        };

        if (!validTransitions[tour.status].includes(status)) {
            return res.status(400).json({
                status: false,
                data: null,
                message: `Cannot change status from ${tour.status} to ${status}`,
                error: 'Invalid status transition'
            });
        }

        // Update tour
        tour.status = status;
        if (notes) {
            tour.landlordNotes = notes;
        }

        await tour.save();

        // Send notification
        await sendTourNotification(tour, status);

        return res.status(200).json({
            status: true,
            data: tour,
            message: `Tour ${status} successfully`
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reschedule tour
export const rescheduleTour = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { date, timeSlot } = req.body;
        const userId = req.user.userId;

        // Find landlord record using user ID
        const landlord = await Landlord.findOne({ user: userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Landlord profile not found',
                error: 'Landlord not found'
            });
        }

        // Validate required fields
        if (!date || !timeSlot) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Date and time slot are required',
                error: 'Missing required fields'
            });
        }

        // Validate date is in the future
        const tourDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (tourDate < today) {
            return res.status(400).json({
                status: false,
                data: null,
                message: 'Tour date must be in the future',
                error: 'Invalid date'
            });
        }

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Tour not found',
                error: 'Tour not found'
            });
        }

        // Check if landlord has permission to reschedule this tour
        if (tour.landlord.toString() !== landlord._id.toString()) {
            return res.status(403).json({
                status: false,
                data: null,
                message: 'Unauthorized access - You can only reschedule your own tours',
                error: 'Unauthorized'
            });
        }

        // Calculate start and end times for the rescheduled tour
        const tourDuration = tour.duration || 30;
        const [startHour, startMinute] = timeSlot.split(':').map(Number);
        const startTime = new Date(tourDate);
        startTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + tourDuration);

        // Check for time conflicts with existing tours (excluding the current tour being rescheduled)
        const existingTours = await Tour.find({
            property: tour.property,
            date: tourDate,
            status: { $in: ['pending', 'confirmed'] },
            _id: { $ne: tourId }
        });

        // Check for time conflicts
        for (const existingTour of existingTours) {
            const [existingStartHour, existingStartMinute] = existingTour.timeSlot.split(':').map(Number);
            const existingStartTime = new Date(tourDate);
            existingStartTime.setHours(existingStartHour, existingStartMinute, 0, 0);
            
            const existingEndTime = new Date(existingStartTime);
            existingEndTime.setMinutes(existingEndTime.getMinutes() + (existingTour.duration || 30));

            // Check if there's a time overlap
            // Conflict occurs when:
            // - Requested start time is before existing end time AND
            // - Requested end time is after existing start time
            if (startTime < existingEndTime && endTime > existingStartTime) {
                return res.status(409).json({
                    status: false,
                    data: null,
                    message: `Time conflict detected. The rescheduled tour time (${timeSlot} for ${tourDuration} minutes) overlaps with an existing tour. Please choose a different time.`,
                    error: 'Time conflict',
                    conflictDetails: {
                        requestedTime: {
                            start: startTime.toLocaleTimeString(),
                            end: endTime.toLocaleTimeString(),
                            duration: tourDuration
                        },
                        conflictingTour: {
                            start: existingStartTime.toLocaleTimeString(),
                            end: existingEndTime.toLocaleTimeString(),
                            duration: existingTour.duration || 30
                        }
                    }
                });
            }
        }

        // Store original date if not already stored
        if (!tour.originalDate) {
            tour.originalDate = tour.date;
        }

        // Update tour
        tour.date = tourDate;
        tour.timeSlot = timeSlot;
        tour.rescheduled = true;
        tour.status = 'pending'; // Reset to pending for approval

        await tour.save();

        // Send notification
        await sendTourNotification(tour, 'rescheduled');

        return res.status(200).json({
            status: true,
            data: tour,
            message: 'Tour rescheduled successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get landlord calendar
export const getTourCalendar = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        // Find landlord record using user ID
        const landlord = await Landlord.findOne({ user: userId });
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: 'Landlord profile not found',
                error: 'Landlord not found'
            });
        }

        // Set default date range if not provided
        let queryStartDate, queryEndDate;
        
        if (startDate && endDate) {
            // Use provided dates
            queryStartDate = new Date(startDate);
            queryEndDate = new Date(endDate);
        } else {
            // Default to current month
            const now = new Date();
            queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
            queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        }

        const tours = await Tour.find({
            landlord: landlord._id,
            date: { $gte: queryStartDate, $lte: queryEndDate }
        })
        .populate('property', 'propertyName address')
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('landlord', 'firstName lastName email phoneNumber')
        .sort({ date: 1, timeSlot: 1 });

        // Group tours by date
        const calendarData = {};
        tours.forEach(tour => {
            const dateKey = tour.date.toISOString().split('T')[0];
            if (!calendarData[dateKey]) {
                calendarData[dateKey] = [];
            }
            calendarData[dateKey].push(tour);
        });

        return res.status(200).json({
            status: true,
            data: {
                calendarData: calendarData,
                dateRange: {
                    startDate: queryStartDate.toISOString().split('T')[0],
                    endDate: queryEndDate.toISOString().split('T')[0],
                    isDefault: !startDate || !endDate
                }
            },
            message: 'Calendar data retrieved successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            data: null,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to send tour notifications
const sendTourNotification = async (tour, action) => {
    try {
        const populatedTour = await Tour.findById(tour._id)
            .populate('property', 'propertyName address')
            .populate('tenant', 'firstName lastName email')
            .populate('landlord', 'firstName lastName email');

        const tourData = {
            propertyName: populatedTour.property.propertyName,
            date: populatedTour.date,
            timeSlot: populatedTour.timeSlot,
            tenantName: `${populatedTour.tenant.firstName} ${populatedTour.tenant.lastName}`,
            landlordName: `${populatedTour.landlord.firstName} ${populatedTour.landlord.lastName}`,
            notes: populatedTour.notes
        };

        const emailTemplate = createTourNotificationEmail(action, tourData);
        if (!emailTemplate) return;

        // Send email to tenant
        if (['confirmed', 'declined', 'cancelled', 'rescheduled'].includes(action)) {
            await sendEmail({
                to: populatedTour.tenant.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
        }

        // Send email to landlord for new requests
        if (action === 'request') {
            await sendEmail({
                to: populatedTour.landlord.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
        }

    } catch (error) {
        console.error('Error sending tour notification:', error);
    }
};

// ==================== LANDLORD NOTIFICATION CONTROLLERS ====================

/**
 * Get all notifications for the current landlord
 */
export const getLandlordNotifications = async (req, res) => {
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

        const { page, limit, filter } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            filter: filter || 'all'
        };

        const result = await getNotifications(landlord._id, 'landlord', options);

        res.json({
            status: true,
            data: result,
            message: "Notifications retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve notifications",
            error: err.message
        });
    }
};

/**
 * Mark a specific notification as read for the current landlord
 */
export const markLandlordNotificationAsReadById = async (req, res) => {
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

        const notification = await markNotificationAsRead(req.params.id, landlord._id, 'landlord');

        res.json({
            status: true,
            data: notification,
            message: "Notification marked as read successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to mark notification as read",
            error: err.message
        });
    }
};

/**
 * Mark all notifications as read for the current landlord
 */
export const markAllLandlordNotificationsAsRead = async (req, res) => {
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

        const result = await markAllNotificationsAsRead(landlord._id, 'landlord');

        res.json({
            status: true,
            data: { modifiedCount: result.modifiedCount },
            message: "All notifications marked as read successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to mark notifications as read",
            error: err.message
        });
    }
};

/**
 * Get unread notification count for the current landlord
 */
export const getUnreadLandlordNotificationCount = async (req, res) => {
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

        const unreadCount = await getUnreadNotificationCount(landlord._id, 'landlord');

        res.json({
            status: true,
            data: { unreadCount },
            message: "Unread count retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to get unread count",
            error: err.message
        });
    }
};

/**
 * Search notifications for the current landlord with multiple filters
 */
export const searchLandlordNotifications = async (req, res) => {
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

        const { 
            readStatus = 'all', 
            timeFilter = 'all', 
            typeFilter = 'all',
            page = 1, 
            limit = 10 
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        let query = { recipient: landlord._id, userRole: 'landlord' };

        // Read status filter
        if (readStatus === 'read') {
            query.read = true;
        } else if (readStatus === 'unread') {
            query.read = false;
        }

        // Time filter
        if (timeFilter !== 'all') {
            const now = new Date();
            let startDate;

            switch (timeFilter) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'yesterday':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    break;
                case '3 days ago':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
                    break;
                case '1 week ago':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                    break;
                default:
                    startDate = null;
            }

            if (startDate) {
                query.createdAt = { $gte: startDate };
            }
        }

        // Type filter
        if (typeFilter !== 'all') {
            const typeMapping = {
                'maintenance': ['maintenance_new_request', 'maintenance_status_updated', 'maintenance_resolved'],
                'message': ['tour_request', 'tour_cancelled', 'tour_rescheduled', 'chat_message'],
                'payment': ['payment_successful', 'payment_failed', 'payment_pending'],
                'document': ['document_uploaded', 'document_approved', 'document_rejected'],
                'system update': ['system_update', 'system_maintenance']
            };

            if (typeMapping[typeFilter]) {
                query.type = { $in: typeMapping[typeFilter] };
            }
        }

        // Get notifications and total count
        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Notification.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            status: true,
            data: {
                notifications,
                total,
                page: parseInt(page),
                pageSize: parseInt(limit),
                totalPages,
                filters: {
                    readStatus,
                    timeFilter,
                    typeFilter
                }
            },
            message: "Notifications retrieved successfully",
            error: null
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve notifications",
            error: err.message
        });
    }
}; 

// ==================== LANDLORD APPLICATION CONTROLLERS ====================

/**
 * Get all rental applications for the landlord
 */
export const getAllApplications = async (req, res) => {
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

        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = { landlord: landlord._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        const applications = await TenantApplication.find(query)
            .populate('property', 'propertyName address monthlyRent propertyType bedrooms bathrooms frontImage')
            .populate('tenant', 'firstName lastName email phoneNumber')
            .populate('landlord', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Fetch rental history for each application's tenant
        const applicationsWithRentalHistory = await Promise.all(
            applications.map(async (application) => {
                const rentalHistory = await RentalHistory.find({ tenant: application.tenant })
                    .sort({ 'rentalDates.startDate': -1 });
                
                return {
                    ...application.toObject(),
                    rentalHistory
                };
            })
        );

        const total = await TenantApplication.countDocuments(query);

        // Get summary statistics
        const summary = await TenantApplication.aggregate([
            { $match: { landlord: landlord._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const summaryStats = {
            total: 0,
            pending: 0,
            approved: 0,
            cancelled: 0
        };

        summary.forEach(stat => {
            summaryStats[stat._id] = stat.count;
            summaryStats.total += stat.count;
        });

        res.json({
            status: true,
            data: {
                applications: applicationsWithRentalHistory,
                summary: summaryStats,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            message: "Applications retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve applications",
            error: error.message
        });
    }
};

/**
 * Get a specific application by ID
 */
export const getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        const application = await TenantApplication.findOne({
            _id: applicationId,
            landlord: landlord._id
        })
        .populate('property', 'propertyName address monthlyRent propertyType bedrooms bathrooms frontImage description')
        .populate('tenant', 'firstName lastName email phoneNumber address country city')
        .populate('landlord', 'firstName lastName email phoneNumber');

        if (!application) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Application not found",
                error: null
            });
        }

        // Fetch rental history for this tenant
        const rentalHistory = await RentalHistory.find({ tenant: application.tenant })
            .sort({ 'rentalDates.startDate': -1 });

        // Attach rental history to application
        const applicationWithRentalHistory = {
            ...application.toObject(),
            rentalHistory
        };

        res.json({
            status: true,
            data: applicationWithRentalHistory,
            message: "Application retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve application",
            error: error.message
        });
    }
};

/**
 * Approve or cancel an application
 */
export const respondToApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { decision } = req.body;
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        if (!['approved', 'cancelled'].includes(decision)) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Decision must be either 'approved' or 'cancelled'",
                error: null
            });
        }

        const application = await TenantApplication.findOne({
            _id: applicationId,
            landlord: landlord._id
        }).populate('property', 'propertyName address');

        if (!application) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Application not found",
                error: null
            });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Application has already been processed",
                error: null
            });
        }

        // Update application status
        application.status = decision;
        await application.save();

        // Create notification for tenant
        await createNotification({
            recipientId: application.tenant,
            userRole: 'tenant',
            type: 'application_response',
            message: `Your application for ${application.property.propertyName} has been ${decision}`
        });

        // Send email notification to tenant
        const tenant = await Tenant.findOne({ user: application.tenant });
        const user = await User.findById(application.tenant);
        
        if (tenant && user) {
            const emailTemplate = decision === 'approved' 
                ? createApplicationApprovedEmail({
                    tenantName: `${tenant.firstName} ${tenant.lastName}`,
                    propertyName: application.property.propertyName,
                    propertyAddress: application.property.address
                })
                : createApplicationCancelledEmail({
                    tenantName: `${tenant.firstName} ${tenant.lastName}`,
                    propertyName: application.property.propertyName,
                    propertyAddress: application.property.address
                });

            await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });
        }

        res.json({
            status: true,
            data: application,
            message: `Application ${decision} successfully`,
            error: null
        });

    } catch (error) {
        console.error('Respond to application error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to respond to application",
            error: error.message
        });
    }
};

/**
 * Get applications for a specific property
 */
export const getPropertyApplications = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Verify the property belongs to the landlord
        const property = await Property.findOne({
            _id: propertyId,
            landlord: landlord._id
        });

        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found",
                error: null
            });
        }

        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = { 
            property: propertyId,
            landlord: landlord._id
        };
        
        if (status && status !== 'all') {
            query.status = status;
        }

        const applications = await TenantApplication.find(query)
            .populate('tenant', 'firstName lastName email phoneNumber')
            .populate('property', 'propertyName address monthlyRent')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Fetch rental history for each application's tenant
        const applicationsWithRentalHistory = await Promise.all(
            applications.map(async (application) => {
                const rentalHistory = await RentalHistory.find({ tenant: application.tenant })
                    .sort({ 'rentalDates.startDate': -1 });
                
                return {
                    ...application.toObject(),
                    rentalHistory
                };
            })
        );

        const total = await TenantApplication.countDocuments(query);

        res.json({
            status: true,
            data: {
                applications: applicationsWithRentalHistory,
                property: {
                    id: property._id,
                    name: property.propertyName,
                    address: property.address
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            message: "Property applications retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get property applications error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve property applications",
            error: error.message
        });
    }
}; 

/**
 * Upload lease document for landlord
 */
export const uploadLeaseDocument = async (req, res) => {
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

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "No lease document uploaded",
                error: null
            });
        }

        // Use the existing uploads function with 'landlord' folder
        const fileInfo = await uploads(req.file.buffer, req.file.originalname, 'landlord');

        // Save the lease template path to landlord record
        landlord.leaseTemplate = fileInfo.path;
        await landlord.save();

        res.json({
            status: true,
            data: {
                documentPath: fileInfo.path,
                documentUrl: `${process.env.BACKEND_BASE_URL}${fileInfo.path}`,
                fileType: fileInfo.type,
                message: "Lease document uploaded successfully"
            },
            message: "Lease document uploaded successfully",
            error: null
        });

    } catch (error) {
        console.error('Upload lease document error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to upload lease document",
            error: error.message
        });
    }
};

/**
 * Get all rooms for a property
 */
export const getPropertyRooms = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Verify the property belongs to this landlord
        const property = await Property.findOne({ 
            _id: propertyId, 
            landlord: landlord._id 
        });
        
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found or access denied",
                error: null
            });
        }

        // Get all rooms for the property
        const rooms = await Room.find({ propertyId }).sort({ floor: 1, roomNumber: 1 });

        res.json({
            status: true,
            data: {
                property: {
                    id: property._id,
                    name: property.propertyName,
                    address: property.address
                },
                rooms
            },
            message: "Property rooms retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get property rooms error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve property rooms",
            error: error.message
        });
    }
};

/**
 * Add a new room to a property
 */
export const addRoomToProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { floor, roomNumber, rent, status = 'available' } = req.body;
        
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Verify the property belongs to this landlord
        const property = await Property.findOne({ 
            _id: propertyId, 
            landlord: landlord._id 
        });
        
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found or access denied",
                error: null
            });
        }

        // Validate required fields
        if (!floor || !roomNumber || !rent) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Floor, room number, and rent are required",
                error: null
            });
        }

        // Create room identifier
        const roomIdentifier = `Floor ${floor}/Rm ${roomNumber}`;

        // Check if room already exists
        const existingRoom = await Room.findOne({
            propertyId,
            roomIdentifier
        });

        if (existingRoom) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Room already exists with this floor and room number",
                error: null
            });
        }

        // Create new room
        const newRoom = new Room({
            propertyId,
            floor,
            roomNumber,
            roomIdentifier,
            rent: parseFloat(rent),
            status
        });

        await newRoom.save();

        res.status(201).json({
            status: true,
            data: newRoom,
            message: "Room added successfully",
            error: null
        });

    } catch (error) {
        console.error('Add room error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to add room",
            error: error.message
        });
    }
};

/**
 * Update a room
 */
export const updateRoom = async (req, res) => {
    try {
        const { propertyId, roomId } = req.params;
        const { floor, roomNumber, rent, status } = req.body;
        
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Verify the property belongs to this landlord
        const property = await Property.findOne({ 
            _id: propertyId, 
            landlord: landlord._id 
        });
        
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found or access denied",
                error: null
            });
        }

        // Find the room and verify it belongs to the property
        const room = await Room.findOne({
            _id: roomId,
            propertyId
        });

        if (!room) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Room not found",
                error: null
            });
        }

        // Prepare update data
        const updateData = {};
        if (floor !== undefined) updateData.floor = floor;
        if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
        if (rent !== undefined) updateData.rent = parseFloat(rent);
        if (status !== undefined) updateData.status = status;

        // If floor or room number is being updated, check for conflicts
        if (floor || roomNumber) {
            const newFloor = floor || room.floor;
            const newRoomNumber = roomNumber || room.roomNumber;
            const newRoomIdentifier = `Floor ${newFloor}/Rm ${newRoomNumber}`;

            // Check if new identifier conflicts with existing room
            const existingRoom = await Room.findOne({
                propertyId,
                roomIdentifier: newRoomIdentifier,
                _id: { $ne: roomId }
            });

            if (existingRoom) {
                return res.status(400).json({
                    status: false,
                    data: null,
                    message: "Room already exists with this floor and room number",
                    error: null
                });
            }

            updateData.roomIdentifier = newRoomIdentifier;
        }

        // Update the room
        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            status: true,
            data: updatedRoom,
            message: "Room updated successfully",
            error: null
        });

    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to update room",
            error: error.message
        });
    }
};

/**
 * Delete a room
 */
export const deleteRoom = async (req, res) => {
    try {
        const { propertyId, roomId } = req.params;
        
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Verify the property belongs to this landlord
        const property = await Property.findOne({ 
            _id: propertyId, 
            landlord: landlord._id 
        });
        
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found or access denied",
                error: null
            });
        }

        // Find the room and verify it belongs to the property
        const room = await Room.findOne({
            _id: roomId,
            propertyId
        });

        if (!room) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Room not found",
                error: null
            });
        }

        // Check if room is currently occupied
        if (room.status === 'occupied' && room.currentLeaseId) {
            return res.status(400).json({
                status: false,
                data: null,
                message: "Cannot delete room that is currently occupied",
                error: null
            });
        }

        // Delete the room
        await Room.findByIdAndDelete(roomId);

        res.json({
            status: true,
            data: null,
            message: "Room deleted successfully",
            error: null
        });

    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to delete room",
            error: error.message
        });
    }
};

/**
 * Get room by ID
 */
export const getRoomById = async (req, res) => {
    try {
        const { propertyId, roomId } = req.params;
        
        const landlord = await Landlord.findOne({ user: req.user.userId });
        
        if (!landlord) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Landlord not found",
                error: null
            });
        }

        // Verify the property belongs to this landlord
        const property = await Property.findOne({ 
            _id: propertyId, 
            landlord: landlord._id 
        });
        
        if (!property) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Property not found or access denied",
                error: null
            });
        }

        // Find the room and verify it belongs to the property
        const room = await Room.findOne({
            _id: roomId,
            propertyId
        }).populate('currentLeaseId', 'tenantId startDate expirationDate status');

        if (!room) {
            return res.status(404).json({
                status: false,
                data: null,
                message: "Room not found",
                error: null
            });
        }

        res.json({
            status: true,
            data: {
                room,
                property: {
                    id: property._id,
                    name: property.propertyName,
                    address: property.address
                }
            },
            message: "Room retrieved successfully",
            error: null
        });

    } catch (error) {
        console.error('Get room by ID error:', error);
        res.status(500).json({
            status: false,
            data: null,
            message: "Failed to retrieve room",
            error: error.message
        });
    }
};

