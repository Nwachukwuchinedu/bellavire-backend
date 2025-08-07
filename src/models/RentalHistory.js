import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     RentalHistory:
 *       type: object
 *       required:
 *         - tenant
 *         - rentalDates
 *         - rentAmount
 *       properties:
 *         tenant:
 *           type: string
 *           description: Reference to the tenant (User ID)
 *         previousLandlord:
 *           type: string
 *           description: Name of the previous landlord
 *         rentalDates:
 *           type: object
 *           required:
 *             - startDate
 *             - endDate
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               description: Start date of the rental period
 *             endDate:
 *               type: string
 *               format: date
 *               description: End date of the rental period
 *         reasonForLeaving:
 *           type: string
 *           description: Reason for leaving the previous rental
 *         rentAmount:
 *           type: number
 *           description: Monthly rent amount for this rental
 *         propertyAddress:
 *           type: string
 *           description: Address of the previous rental property
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record update timestamp
 *       example:
 *         tenant: "507f1f77bcf86cd799439011"
 *         previousLandlord: "Jane Smith"
 *         rentalDates:
 *           startDate: "2022-01-01"
 *           endDate: "2023-12-31"
 *         reasonForLeaving: "Moving to a new city for work"
 *         rentAmount: 1500
 *         propertyAddress: "456 Oak St, New York, NY 10002"
 */
const rentalHistorySchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    previousLandlord: {
        type: String,
        required: false,
        trim: true,
        maxlength: 100
    },
    rentalDates: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    reasonForLeaving: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500
    },
    rentAmount: {
        type: Number,
        required: true,
        min: 0
    },
    propertyAddress: {
        type: String,
        trim: true,
        maxlength: 200
    },
    // Additional fields for current rentals
    propertyName: {
        type: String,
        trim: true,
        maxlength: 200
    },
    landlordName: {
        type: String,
        trim: true,
        maxlength: 200
    },
    depositAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    leaseTerms: {
        duration: {
            type: String,
            trim: true
        },
        paymentFrequency: {
            type: String,
            trim: true
        },
        utilitiesIncluded: [{
            type: String,
            trim: true
        }]
    },
    propertyDetails: {
        bedrooms: {
            type: Number,
            min: 0
        },
        bathrooms: {
            type: Number,
            min: 0
        },
        propertyType: [{
            type: String,
            trim: true
        }],
        furnished: {
            type: Boolean,
            default: false
        }
    },
    roomDetails: {
        floor: {
            type: String,
            trim: true
        },
        room: {
            type: String,
            trim: true
        },
        roomIdentifier: {
            type: String,
            trim: true
        }
    },
    paymentHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            min: 0
        },
        type: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            trim: true
        },
        transactionId: {
            type: String,
            trim: true
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'terminated'],
        default: 'active'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// Index for efficient queries
rentalHistorySchema.index({ tenant: 1, 'rentalDates.startDate': -1 });
rentalHistorySchema.index({ tenant: 1, createdAt: -1 });

const RentalHistory = mongoose.model('RentalHistory', rentalHistorySchema);

export default RentalHistory; 