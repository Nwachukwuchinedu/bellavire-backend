import Chat from '../models/Chat.js';
import Tenant from '../models/Tenant.js';
import Landlord from '../models/Landlord.js';
import Property from '../models/Property.js';
import { emitToUser } from '../services/socketService.js';

export class ChatController {
    // Send a message from tenant to landlord or vice versa
    static async sendMessage(req, res) {
        try {
            const { recipientId, recipientType, content, propertyId } = req.body;
            const senderId = req.user?.userId;
            const senderType = req.user?.role; // 'tenant' or 'landlord'

            if (!content || !recipientId || !recipientType) {
                return res.status(400).json({
                    success: false,
                    error: 'Content, recipientId, and recipientType are required'
                });
            }

            if (senderType === recipientType) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot send message to same user type'
                });
            }

            // Validate sender and recipient exist
            let sender, recipient;
            if (senderType === 'tenant') {
                sender = await Tenant.findOne({ user: senderId });
                recipient = await Landlord.findById(recipientId);
            } else {
                sender = await Landlord.findOne({ user: senderId });
                recipient = await Tenant.findById(recipientId);
            }

            if (!sender || !recipient) {
                return res.status(404).json({
                    success: false,
                    error: 'Sender or recipient not found'
                });
            }

            // Find or create chat
            let chat;
            if (senderType === 'tenant') {
                chat = await Chat.findOne({
                    tenantId: sender._id,
                    landlordId: recipientId
                });
            } else {
                chat = await Chat.findOne({
                    tenantId: recipientId,
                    landlordId: sender._id
                });
            }

            if (!chat) {
                // Create new chat
                chat = new Chat({
                    tenantId: senderType === 'tenant' ? sender._id : recipientId,
                    landlordId: senderType === 'landlord' ? sender._id : recipientId,
                    propertyId: propertyId || null,
                    messages: []
                });
            }

            // Add message
            const message = {
                senderId: sender._id,
                senderType: senderType,
                content: content,
                timestamp: new Date(),
                isRead: false
            };

            chat.messages.push(message);
            chat.lastMessageAt = new Date();
            await chat.save();

            // Emit real-time message to recipient
            try {
                // Get the recipient's User ID (not Tenant/Landlord ID)
                const recipientUserId = recipient.user;
                console.log('📤 Emitting message to user:', recipientUserId);
                emitToUser(recipientUserId, 'message-received', {
                    chatId: chat._id,
                    message: message,
                    senderId: sender._id,
                    senderType: senderType
                });
            } catch (error) {
                console.error('Failed to emit socket event:', error);
            }

            res.json({
                success: true,
                message: 'Message sent successfully',
                data: {
                    chatId: chat._id,
                    message: message
                }
            });

        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ success: false, error: 'Failed to send message' });
        }
    }

    // Get chat history between tenant and landlord
    static async getChatHistory(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user?.userId;
            const userType = req.user?.role;

            const chat = await Chat.findById(chatId)
                .populate('tenantId', 'firstName lastName email')
                .populate('landlordId', 'firstName lastName email')
                .populate('propertyId', 'propertyName address');

            if (!chat) {
                return res.status(404).json({ success: false, error: 'Chat not found' });
            }

            // Verify user has access to this chat
            let user;
            if (userType === 'tenant') {
                user = await Tenant.findOne({ user: userId });
                if (!user || chat.tenantId._id.toString() !== user._id.toString()) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access to chat' });
                }
            } else if (userType === 'landlord') {
                user = await Landlord.findOne({ user: userId });
                if (!user || chat.landlordId._id.toString() !== user._id.toString()) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access to chat' });
                }
            }

            res.json({
                success: true,
                data: {
                    chat: chat,
                    otherParty: userType === 'tenant' ? chat.landlordId : chat.tenantId
                }
            });

        } catch (error) {
            console.error('Get chat history error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
        }
    }

    // Get paginated chat history
    static async getChatHistoryPaginated(req, res) {
        try {
            const { chatId } = req.params;
            const { before, after, limit = 20 } = req.query;
            const userId = req.user?.userId;
            const userType = req.user?.role;

            const chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ success: false, error: 'Chat not found' });
            }

            // Verify user has access to this chat
            let user;
            if (userType === 'tenant') {
                user = await Tenant.findOne({ user: userId });
                if (!user || chat.tenantId.toString() !== user._id.toString()) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access to chat' });
                }
            } else if (userType === 'landlord') {
                user = await Landlord.findOne({ user: userId });
                if (!user || chat.landlordId.toString() !== user._id.toString()) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access to chat' });
                }
            }

            let messages = chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            let filtered = messages;
            let hasMoreBefore = false;
            let hasMoreAfter = false;
            let paginated = [];

            if (after) {
                filtered = messages.filter(m => new Date(m.timestamp) > new Date(after));
                paginated = filtered.slice(0, limit);
                hasMoreAfter = filtered.length > paginated.length;
                hasMoreBefore = messages.some(m => new Date(m.timestamp) <= new Date(after));
            } else if (before) {
                filtered = messages.filter(m => new Date(m.timestamp) < new Date(before));
                paginated = filtered.slice(-limit);
                hasMoreBefore = filtered.length > paginated.length;
                hasMoreAfter = messages.some(m => new Date(m.timestamp) >= new Date(before));
            } else {
                paginated = messages.slice(-limit);
                hasMoreBefore = messages.length > paginated.length;
                hasMoreAfter = false;
            }

            res.json({
                success: true,
                data: {
                    messages: paginated,
                    hasMoreBefore,
                    hasMoreAfter
                }
            });

        } catch (error) {
            console.error('Get paginated chat history error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch paginated chat history' });
        }
    }

    // Get all chats for the authenticated user
    static async getUserChats(req, res) {
        try {
            const userId = req.user?.userId;
            const userType = req.user?.role;

            let user;
            let chats;

            if (userType === 'tenant') {
                user = await Tenant.findOne({ user: userId });
                if (!user) {
                    return res.status(404).json({ success: false, error: 'Tenant not found' });
                }
                chats = await Chat.find({ tenantId: user._id })
                    .populate('landlordId', 'firstName lastName email')
                    .populate('propertyId', 'propertyName address')
                    .sort({ lastMessageAt: -1 });
            } else if (userType === 'landlord') {
                user = await Landlord.findOne({ user: userId });
                if (!user) {
                    return res.status(404).json({ success: false, error: 'Landlord not found' });
                }
                chats = await Chat.find({ landlordId: user._id })
                    .populate('tenantId', 'firstName lastName email')
                    .populate('propertyId', 'propertyName address')
                    .sort({ lastMessageAt: -1 });
            }

            res.json({
                success: true,
                data: {
                    chats: chats,
                    userType: userType
                }
            });

        } catch (error) {
            console.error('Get user chats error:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch user chats' });
        }
    }

    // Mark messages as read
    static async markMessagesAsRead(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user?.userId;
            const userType = req.user?.role;

            const chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ success: false, error: 'Chat not found' });
            }

            // Verify user has access to this chat
            let user;
            if (userType === 'tenant') {
                user = await Tenant.findOne({ user: userId });
                if (!user || chat.tenantId.toString() !== user._id.toString()) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access to chat' });
                }
            } else if (userType === 'landlord') {
                user = await Landlord.findOne({ user: userId });
                if (!user || chat.landlordId.toString() !== user._id.toString()) {
                    return res.status(403).json({ success: false, error: 'Unauthorized access to chat' });
                }
            }

            // Mark messages from other party as read
            const otherPartyId = userType === 'tenant' ? chat.landlordId : chat.tenantId;
            const updateResult = await Chat.updateMany(
                {
                    _id: chatId,
                    'messages.senderId': otherPartyId,
                    'messages.isRead': false
                },
                {
                    $set: { 'messages.$.isRead': true }
                }
            );

            // Emit real-time read status to the other party
            try {
                const otherParty = userType === 'tenant' ?
                    await Landlord.findById(otherPartyId) :
                    await Tenant.findById(otherPartyId);

                if (otherParty && otherParty.user) {
                    emitToUser(otherParty.user, 'messages-read', {
                        chatId: chatId,
                        readBy: userType
                    });
                }
            } catch (error) {
                console.error('Failed to emit read status:', error);
            }

            res.json({
                success: true,
                message: 'Messages marked as read',
                data: {
                    updatedCount: updateResult.modifiedCount
                }
            });

        } catch (error) {
            console.error('Mark messages as read error:', error);
            res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
        }
    }

    // Get unread message count
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user?.userId;
            const userType = req.user?.role;

            let user;
            if (userType === 'tenant') {
                user = await Tenant.findOne({ user: userId });
            } else if (userType === 'landlord') {
                user = await Landlord.findOne({ user: userId });
            }

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const chats = await Chat.find({
                $or: [
                    { tenantId: user._id },
                    { landlordId: user._id }
                ]
            });

            let totalUnread = 0;
            chats.forEach(chat => {
                chat.messages.forEach(message => {
                    if (message.senderId.toString() !== user._id.toString() && !message.isRead) {
                        totalUnread++;
                    }
                });
            });

            res.json({
                success: true,
                data: {
                    unreadCount: totalUnread
                }
            });

        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({ success: false, error: 'Failed to get unread count' });
        }
    }

    // Search users for starting new chats
    static async searchUsers(req, res) {
        try {
            const { q, role } = req.query;
            const userId = req.user?.userId;
            const userType = req.user?.role;

            if (!q || !role) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query and role are required'
                });
            }

            // Validate role
            if (!['tenant', 'landlord'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid role. Must be tenant or landlord'
                });
            }

            // Users can only search for users of the opposite type
            if (userType === role) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot search for users of the same type'
                });
            }

            let users;
            if (role === 'tenant') {
                // Search for tenants
                users = await Tenant.find({
                    $or: [
                        { firstName: { $regex: q, $options: 'i' } },
                        { lastName: { $regex: q, $options: 'i' } },
                        { email: { $regex: q, $options: 'i' } }
                    ]
                })
                    .populate('user', 'firstName lastName email role')
                    .limit(10);
            } else {
                // Search for landlords
                users = await Landlord.find({
                    $or: [
                        { firstName: { $regex: q, $options: 'i' } },
                        { lastName: { $regex: q, $options: 'i' } },
                        { email: { $regex: q, $options: 'i' } }
                    ]
                })
                    .populate('user', 'firstName lastName email role')
                    .limit(10);
            }

            // Transform the data to include user info
            const transformedUsers = users.map(user => ({
                _id: user._id,
                firstName: user.firstName || user.user?.firstName,
                lastName: user.lastName || user.user?.lastName,
                email: user.email || user.user?.email,
                role: role
            }));

            res.json({
                success: true,
                data: transformedUsers
            });

        } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json({ success: false, error: 'Failed to search users' });
        }
    }
}

// Export individual functions for use in routes
export const sendMessage = ChatController.sendMessage;
export const getChatHistory = ChatController.getChatHistory;
export const getChatHistoryPaginated = ChatController.getChatHistoryPaginated;
export const getUserChats = ChatController.getUserChats;
export const markMessagesAsRead = ChatController.markMessagesAsRead;
export const getUnreadCount = ChatController.getUnreadCount;
export const searchUsers = ChatController.searchUsers;
