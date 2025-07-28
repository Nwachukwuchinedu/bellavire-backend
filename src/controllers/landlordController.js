import Landlord from "../models/Landlord.js";
import Property from "../models/Property.js";
import Maintenance from "../models/Maintenance.js";
import Contractor from "../models/Contractor.js";
import validator from "../validation/dynamicValidateAndSanitize.js";
import { uploads } from "../utils/fileUtils.js";

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

        // Transform the data to include both ID and populated data
        const transformedMaintenances = maintenances.map(maintenance => ({
            ...maintenance.toObject(),
            tenant: maintenance.tenant ? {
                id: maintenance.tenant._id,
                ...maintenance.tenant.toObject()
            } : null,
            property: maintenance.propertyId ? {
                id: maintenance.propertyId._id,
                ...maintenance.propertyId.toObject()
            } : null,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null
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

        // Transform the data to include both ID and populated data
        const transformedMaintenance = {
            ...maintenance.toObject(),
            tenant: maintenance.tenant ? {
                id: maintenance.tenant._id,
                ...maintenance.tenant.toObject()
            } : null,
            property: maintenance.propertyId ? {
                id: maintenance.propertyId._id,
                ...maintenance.propertyId.toObject()
            } : null,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null
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

        // Transform the data to include both ID and populated data
        const transformedMaintenance = {
            ...maintenance.toObject(),
            tenant: maintenance.tenant ? {
                id: maintenance.tenant._id,
                ...maintenance.tenant.toObject()
            } : null,
            property: maintenance.propertyId ? {
                id: maintenance.propertyId._id,
                ...maintenance.propertyId.toObject()
            } : null,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null
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

        // Transform the data to include both ID and populated data
        const transformedMaintenance = {
            ...maintenance.toObject(),
            tenant: maintenance.tenant ? {
                id: maintenance.tenant._id,
                ...maintenance.tenant.toObject()
            } : null,
            property: maintenance.propertyId ? {
                id: maintenance.propertyId._id,
                ...maintenance.propertyId.toObject()
            } : null,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null
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

        // Transform the data to include both ID and populated data
        const transformedMaintenance = {
            ...maintenance.toObject(),
            tenant: maintenance.tenant ? {
                id: maintenance.tenant._id,
                ...maintenance.tenant.toObject()
            } : null,
            property: maintenance.propertyId ? {
                id: maintenance.propertyId._id,
                ...maintenance.propertyId.toObject()
            } : null,
            contractor: maintenance.contractor.contractorId ? {
                ...maintenance.contractor.contractorId.toObject()
            } : null
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