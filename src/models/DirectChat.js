import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     DirectMessage:
 *       type: object
 *       properties:
 *         senderId:
 *           type: string
 *           description: ObjectId of the sender
 *         senderRole:
 *           type: string
 *           enum: [landlord, tenant, agent]
 *           description: Role of the sender
 *         content:
 *           type: string
 *           description: Message content
 *         messageType:
 *           type: string
 *           enum: [text, image, document, audio]
 *           default: text
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *         timestamp:
 *           type: string
 *           format: date-time
 *         readBy:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               readAt:
 *                 type: string
 *                 format: date-time
 *         edited:
 *           type: boolean
 *           default: false
 *         editedAt:
 *           type: string
 *           format: date-time
 *     DirectChat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [landlord, tenant, agent]
 *               joinedAt:
 *                 type: string
 *                 format: date-time
 *         propertyId:
 *           type: string
 *           description: Related property ObjectId
 *         chatType:
 *           type: string
 *           enum: [landlord_tenant, tenant_agent, landlord_agent, group]
 *           default: landlord_tenant
 *         subject:
 *           type: string
 *           description: Chat subject or topic
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DirectMessage'
 *         lastMessage:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             senderId:
 *               type: string
 *             timestamp:
 *               type: string
 *               format: date-time
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const directMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['landlord', 'tenant', 'agent'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'document', 'audio'],
        default: 'text'
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number
    }],
    timestamp: {
        type: Date,
        default: Date.now
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: Date
});

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['landlord', 'tenant', 'agent'],
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

const directChatSchema = new mongoose.Schema({
    participants: [participantSchema],
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: false
    },
    chatType: {
        type: String,
        enum: ['landlord_tenant', 'tenant_agent', 'landlord_agent', 'group'],
        default: 'landlord_tenant'
    },
    subject: {
        type: String,
        trim: true,
        maxlength: 200
    },
    messages: [directMessageSchema],
    lastMessage: {
        content: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
directChatSchema.index({ 'participants.userId': 1 });
directChatSchema.index({ propertyId: 1 });
directChatSchema.index({ chatType: 1 });
directChatSchema.index({ createdAt: -1 });
directChatSchema.index({ 'lastMessage.timestamp': -1 });

// Pre-save middleware to update lastMessage
directChatSchema.pre('save', function(next) {
    if (this.messages && this.messages.length > 0) {
        const lastMsg = this.messages[this.messages.length - 1];
        this.lastMessage = {
            content: lastMsg.content,
            senderId: lastMsg.senderId,
            timestamp: lastMsg.timestamp
        };
    }
    next();
});

// Method to add a participant
directChatSchema.methods.addParticipant = function(userId, role) {
    const existingParticipant = this.participants.find(
        p => p.userId.toString() === userId.toString()
    );
    
    if (!existingParticipant) {
        this.participants.push({
            userId,
            role,
            joinedAt: new Date()
        });
    }
    
    return this.save();
};

// Method to remove a participant
directChatSchema.methods.removeParticipant = function(userId) {
    this.participants = this.participants.filter(
        p => p.userId.toString() !== userId.toString()
    );
    
    return this.save();
};

// Method to add a message
directChatSchema.methods.addMessage = function(messageData) {
    const message = {
        senderId: messageData.senderId,
        senderRole: messageData.senderRole,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        attachments: messageData.attachments || [],
        timestamp: new Date()
    };
    
    this.messages.push(message);
    
    // Update lastMessage
    this.lastMessage = {
        content: message.content,
        senderId: message.senderId,
        timestamp: message.timestamp
    };
    
    return this.save();
};

// Method to mark message as read
directChatSchema.methods.markAsRead = function(messageId, userId) {
    const message = this.messages.id(messageId);
    if (message) {
        const existingRead = message.readBy.find(
            r => r.userId.toString() === userId.toString()
        );
        
        if (!existingRead) {
            message.readBy.push({
                userId,
                readAt: new Date()
            });
        }
    }
    
    return this.save();
};

// Static method to find chats by participant
directChatSchema.statics.findByParticipant = function(userId, options = {}) {
    const query = {
        'participants.userId': userId,
        isActive: true
    };
    
    if (options.chatType) {
        query.chatType = options.chatType;
    }
    
    if (options.propertyId) {
        query.propertyId = options.propertyId;
    }
    
    return this.find(query)
        .populate('participants.userId', 'firstName lastName email role')
        .populate('propertyId', 'propertyName address')
        .sort({ 'lastMessage.timestamp': -1 })
        .limit(options.limit || 50);
};

// Static method to find or create a chat between specific participants
directChatSchema.statics.findOrCreateChat = async function(participant1, participant2, propertyId = null) {
    const query = {
        'participants.userId': { $all: [participant1.userId, participant2.userId] },
        participants: { $size: 2 },
        isActive: true
    };
    
    if (propertyId) {
        query.propertyId = propertyId;
    }
    
    let chat = await this.findOne(query);
    
    if (!chat) {
        // Determine chat type based on participant roles
        let chatType = 'landlord_tenant';
        if ((participant1.role === 'tenant' && participant2.role === 'agent') ||
            (participant1.role === 'agent' && participant2.role === 'tenant')) {
            chatType = 'tenant_agent';
        } else if ((participant1.role === 'landlord' && participant2.role === 'agent') ||
                   (participant1.role === 'agent' && participant2.role === 'landlord')) {
            chatType = 'landlord_agent';
        }
        
        chat = new this({
            participants: [
                {
                    userId: participant1.userId,
                    role: participant1.role,
                    joinedAt: new Date()
                },
                {
                    userId: participant2.userId,
                    role: participant2.role,
                    joinedAt: new Date()
                }
            ],
            propertyId,
            chatType,
            isActive: true
        });
        
        await chat.save();
    }
    
    return chat;
};

const DirectChat = mongoose.model('DirectChat', directChatSchema);

export default DirectChat;