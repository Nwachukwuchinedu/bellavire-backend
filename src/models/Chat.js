import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         senderId:
 *           type: string
 *           description: ID of the sender (tenant or landlord)
 *         senderType:
 *           type: string
 *           enum: [tenant, landlord]
 *           description: Type of sender
 *         content:
 *           type: string
 *           description: Message content
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Message timestamp
 *         isRead:
 *           type: boolean
 *           default: false
 *           description: Whether the message has been read
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         tenantId:
 *           type: string
 *           description: Reference to Tenant model
 *         landlordId:
 *           type: string
 *           description: Reference to Landlord model
 *         propertyId:
 *           type: string
 *           description: Reference to Property model (optional)
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderType'
    },
    senderType: {
        type: String,
        required: true,
        enum: ['tenant', 'landlord']
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

const chatSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    landlordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Landlord',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: false
    },
    messages: [messageSchema],
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
chatSchema.index({ tenantId: 1, landlordId: 1 });
chatSchema.index({ propertyId: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Compound unique index to ensure one chat per tenant-landlord pair
chatSchema.index({ tenantId: 1, landlordId: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
