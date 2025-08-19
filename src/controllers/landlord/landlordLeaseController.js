import Landlord from "../../models/Landlord.js";
import Lease from "../../models/Lease.js";
import TenantPayment from "../../models/TenantPayment.js";
import RentalHistory from "../../models/RentalHistory.js";
import Tenant from "../../models/Tenant.js";

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

        // Remove redundant fields from the response
        delete leaseObj.tenantId;
        delete leaseObj.landlordId;
        delete leaseObj.propertyId;

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
