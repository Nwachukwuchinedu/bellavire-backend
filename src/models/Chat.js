import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *         content:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         senderId:
 *           type: string
 *           description: ObjectId of the sender (for multi-participant chats)
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant user IDs (for multi-participant chats)
 *         chatType:
 *           type: string
 *           enum: [ai_chat, direct_chat]
 *           default: ai_chat
 *         conversation:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false // Optional for backward compatibility with AI chats
    }
});

const chatSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false // Made optional for multi-participant chats
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], // For multi-participant chats
    chatType: {
        type: String,
        enum: ['ai_chat', 'direct_chat'],
        default: 'ai_chat'
    },
    conversation: [messageSchema],
    createdAt: { type: Date, default: Date.now }
});

// Index for better performance
chatSchema.index({ userId: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ chatType: 1 });
chatSchema.index({ createdAt: -1 });

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
    if (this.chatType === 'ai_chat') {
        return this.userId && this.userId.toString() === userId.toString();
    } else {
        return this.participants.some(p => p.toString() === userId.toString());
    }
};

// Method to add participant (for direct chats)
chatSchema.methods.addParticipant = function(userId) {
    if (this.chatType === 'direct_chat' && !this.isParticipant(userId)) {
        this.participants.push(userId);
    }
    return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;