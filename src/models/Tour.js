import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * @swagger
 * components:
 *   schemas:
 *     Tour:
 *       type: object
 *       required:
 *         - landlord
 *         - tenant
 *         - property
 *         - date
 *         - timeSlot
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the tour
 *         landlord:
 *           type: string
 *           description: ID of the landlord (Landlord model)
 *         tenant:
 *           type: string
 *           description: ID of the tenant requesting the tour (Tenant model)
 *         property:
 *           type: string
 *           description: ID of the property to tour
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the tour
 *         timeSlot:
 *           type: string
 *           enum: [09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00]
 *           description: Time slot for the tour
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         status:
 *           type: string
 *           enum: [pending, confirmed, declined, cancelled, completed]
 *           description: Status of the tour request
 *         tourType:
 *           type: string
 *           enum: [in-person, virtual]
 *           description: Type of tour
 *         notes:
 *           type: string
 *           description: Additional notes from tenant
 *         landlordNotes:
 *           type: string
 *           description: Notes from landlord
 *         rescheduled:
 *           type: boolean
 *           description: Whether the tour was rescheduled
 *         originalDate:
 *           type: string
 *           format: date
 *           description: Original date if rescheduled
 *         notificationSent:
 *           type: boolean
 *           description: Whether notification was sent
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 60d0fe4f5311236168a109cf
 *         landlord: 60d0fe4f5311236168a109ca
 *         tenant: 60d0fe4f5311236168a109cb
 *         property: 60d0fe4f5311236168a109cc
 *         date: "2024-07-15"
 *         timeSlot: "14:00"
 *         duration: 30
 *         status: "pending"
 *         tourType: "in-person"
 *         notes: "I'm interested in the property and would like to see it in person"
 *         landlordNotes: ""
 *         rescheduled: false
 *         originalDate: null
 *         notificationSent: false
 *         createdAt: "2024-06-01T10:00:00Z"
 *         updatedAt: "2024-06-01T10:00:00Z"
 */
const tourSchema = new Schema({
    landlord: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Landlord', 
        required: true 
    },
    tenant: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tenant', 
        required: true 
    },
    property: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Property', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    timeSlot: {
        type: String,
        enum: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        required: true
    },
    duration: {
        type: Number,
        default: 30, // 30 minutes default
        min: 15,
        max: 120
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'declined', 'cancelled', 'completed'],
        default: 'pending'
    },
    tourType: {
        type: String,
        enum: ['in-person', 'virtual'],
        default: 'in-person'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    landlordNotes: {
        type: String,
        maxlength: 500
    },
    rescheduled: {
        type: Boolean,
        default: false
    },
    originalDate: {
        type: Date,
        default: null
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, { 
    timestamps: true 
});

// Indexes for better query performance
tourSchema.index({ landlord: 1, date: 1 });
tourSchema.index({ tenant: 1, date: 1 });
tourSchema.index({ property: 1, date: 1 });
tourSchema.index({ status: 1 });
tourSchema.index({ date: 1, timeSlot: 1 });

// Virtual for formatted date and time
tourSchema.virtual('formattedDateTime').get(function() {
    const date = this.date.toLocaleDateString('en-GB');
    return `${date} at ${this.timeSlot}`;
});

// Virtual for checking if tour is in the past
tourSchema.virtual('isPast').get(function() {
    const now = new Date();
    const tourDateTime = new Date(this.date);
    tourDateTime.setHours(parseInt(this.timeSlot.split(':')[0]), parseInt(this.timeSlot.split(':')[1]));
    return tourDateTime < now;
});

// Ensure virtual fields are serialized
tourSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        return ret;
    }
});

const Tour = model('Tour', tourSchema);
export default Tour; 