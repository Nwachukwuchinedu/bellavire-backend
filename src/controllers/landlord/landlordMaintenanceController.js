import Landlord from "../../models/Landlord.js";
import Maintenance from "../../models/Maintenance.js";
import Contractor from "../../models/Contractor.js";
import { createNotification, sendEmailNotification } from "../../services/notificationService.js";
import { createMaintenanceNotificationEmail } from "../../templates/tenantNotification.js";

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
