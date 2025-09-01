import DirectChat from '../models/DirectChat.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import realTimeChatService from '../services/realTimeChatService.js';
import { notificationService } from '../services/notificationService.js';

export class DirectChatController {
    /**
     * Helper method to check if a user is a participant in a chat
     * Handles both populated and non-populated participant data
     */
    static isUserParticipant(chat, userId) {
        // Convert userId to string for consistent comparison
        const userIdStr = userId.toString();
        
        return chat.participants.some(p => {
            // Handle populated participants (userId is an object with _id)
            if (p.userId && p.userId._id) {
                return p.userId._id.toString() === userIdStr;
            }
            // Handle non-populated participants (userId is directly an ObjectId)
            return p.userId.toString() === userIdStr;
        });
    }

    /**
     * Create a new chat between participants
     */
    static async createChat(req, res) {
        try {
            const { participantId, propertyId, subject } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.role;

            if (!participantId) {
                return res.status(400).json({ error: 'Participant ID is required' });
            }

            // Validate participant exists
            const participant = await User.findById(participantId).select('firstName lastName role isActive');
            if (!participant || !participant.isActive) {
                return res.status(404).json({ error: 'Participant not found or inactive' });
            }

            // Validate property if provided
            if (propertyId) {
                const property = await Property.findById(propertyId);
                if (!property) {
                    return res.status(404).json({ error: 'Property not found' });
                }
            }

            // Create or find existing chat
            const chat = await DirectChat.findOrCreateChat(
                { userId, role: userRole },
                { userId: participantId, role: participant.role },
                propertyId
            );

            if (subject && subject.trim()) {
                chat.subject = subject.trim();
                await chat.save();
            }

            // Populate the response
            await chat.populate('participants.userId', 'firstName lastName email role');
            await chat.populate('propertyId', 'propertyName address');

            // Notify via real-time service if participant is online
            const participantSocket = realTimeChatService.getSocketByUserId(participantId);
            if (participantSocket) {
                participantSocket.emit('new_chat_request', {
                    chatId: chat._id,
                    participants: chat.participants,
                    subject: chat.subject,
                    chatType: chat.chatType,
                    propertyId: chat.propertyId,
                    createdAt: chat.createdAt
                });
            } else {
                // Send notification to offline user
                await notificationService.createNotification({
                    userId: participantId,
                    userRole: participant.role,
                    type: 'new_chat',
                    title: 'New Chat Request',
                    message: `${req.user.firstName || 'Someone'} started a chat with you`,
                    data: {
                        chatId: chat._id,
                        senderId: userId,
                        senderName: `${req.user.firstName} ${req.user.lastName}`,
                        subject: subject || 'No subject'
                    }
                });
            }

            res.status(201).json({
                success: true,
                chat: {
                    _id: chat._id,
                    participants: chat.participants,
                    propertyId: chat.propertyId,
                    chatType: chat.chatType,
                    subject: chat.subject,
                    lastMessage: chat.lastMessage,
                    isActive: chat.isActive,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt
                }
            });

        } catch (error) {
            console.error('Create chat error:', error);
            res.status(500).json({ error: 'Failed to create chat' });
        }
    }

    /**
     * Get user's active chats
     */
    static async getUserChats(req, res) {
        try {
            const userId = req.user.userId;
            const { chatType, propertyId, limit = 50, page = 1 } = req.query;

            const options = {
                chatType,
                propertyId,
                limit: parseInt(limit),
                page: parseInt(page)
            };

            const chats = await DirectChat.findByParticipant(userId, options);

            // Add online status for participants
            const chatsWithStatus = chats.map(chat => {
                const participantsWithStatus = chat.participants.map(participant => {
                    const isOnline = realTimeChatService.activeUsers.has(participant.userId._id.toString());
                    return {
                        ...participant.toObject(),
                        isOnline
                    };
                });

                return {
                    ...chat.toObject(),
                    participants: participantsWithStatus
                };
            });

            res.json({
                success: true,
                chats: chatsWithStatus,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: chatsWithStatus.length
                }
            });

        } catch (error) {
            console.error('Get user chats error:', error);
            res.status(500).json({ error: 'Failed to fetch chats' });
        }
    }

    /**
     * Get specific chat details
     */
    static async getChatDetails(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user.userId;

            const chat = await DirectChat.findById(chatId)
                .populate('participants.userId', 'firstName lastName email role')
                .populate('propertyId', 'propertyName address propertyImages');

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Check if user is a participant
            if (!DirectChatController.isUserParticipant(chat, userId)) {
                return res.status(403).json({ error: 'Access denied to this chat' });
            }

            // Add online status for participants
            const participantsWithStatus = chat.participants.map(participant => {
                const isOnline = realTimeChatService.activeUsers.has(participant.userId._id.toString());
                return {
                    ...participant.toObject(),
                    isOnline
                };
            });

            res.json({
                success: true,
                chat: {
                    ...chat.toObject(),
                    participants: participantsWithStatus
                }
            });

        } catch (error) {
            console.error('Get chat details error:', error);
            res.status(500).json({ error: 'Failed to fetch chat details' });
        }
    }

    /**
     * Send a message in a chat
     */
    static async sendMessage(req, res) {
        try {
            const { chatId } = req.params;
            const { content, messageType = 'text' } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.role;
            const userName = `${req.user.firstName} ${req.user.lastName}`;

            if (!content || content.trim() === '') {
                return res.status(400).json({ error: 'Message content is required' });
            }

            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Check if user is a participant
            if (!DirectChatController.isUserParticipant(chat, userId)) {
                return res.status(403).json({ error: 'Access denied to this chat' });
            }

            // Handle file attachments if any
            let attachments = [];
            if (req.files && req.files.length > 0) {
                // In a real implementation, you would upload files to storage (AWS S3, etc.)
                // For now, we'll just create placeholder attachment objects
                attachments = req.files.map(file => ({
                    fileName: file.originalname,
                    fileUrl: `/uploads/${file.filename}`, // Placeholder URL
                    fileType: file.mimetype,
                    fileSize: file.size
                }));
            }

            // Add message to chat
            const messageData = {
                senderId: userId,
                senderRole: userRole,
                content: content.trim(),
                messageType,
                attachments
            };

            await chat.addMessage(messageData);

            // Get the newly added message
            const newMessage = chat.messages[chat.messages.length - 1];

            const messageResponse = {
                messageId: newMessage._id,
                chatId,
                senderId: userId,
                senderName: userName,
                senderRole: userRole,
                content: newMessage.content,
                messageType: newMessage.messageType,
                attachments: newMessage.attachments,
                timestamp: newMessage.timestamp,
                readBy: newMessage.readBy
            };

            // Emit real-time message to all participants
            const roomName = `chat_${chatId}`;
            realTimeChatService.io?.to(roomName).emit('new_message', messageResponse);

            // Send notifications to offline participants
            await realTimeChatService.sendNotificationsToOfflineUsers(chat, messageResponse);

            res.status(201).json({
                success: true,
                message: messageResponse
            });

        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    /**
     * Get chat messages with pagination
     */
    static async getChatMessages(req, res) {
        try {
            const { chatId } = req.params;
            const { limit = 50, before, after } = req.query;
            const userId = req.user.userId;

            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Check if user is a participant
            if (!DirectChatController.isUserParticipant(chat, userId)) {
                return res.status(403).json({ error: 'Access denied to this chat' });
            }

            let messages = chat.messages;

            // Apply time-based filtering
            if (before) {
                messages = messages.filter(msg => msg.timestamp < new Date(before));
            }
            if (after) {
                messages = messages.filter(msg => msg.timestamp > new Date(after));
            }

            // Sort and paginate
            const sortedMessages = messages
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, parseInt(limit))
                .reverse();

            res.json({
                success: true,
                messages: sortedMessages,
                pagination: {
                    limit: parseInt(limit),
                    hasMore: chat.messages.length > sortedMessages.length,
                    before: before || null,
                    after: after || null
                }
            });

        } catch (error) {
            console.error('Get chat messages error:', error);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(req, res) {
        try {
            const { chatId } = req.params;
            const { messageIds } = req.body;
            const userId = req.user.userId;

            if (!messageIds || !Array.isArray(messageIds)) {
                return res.status(400).json({ error: 'Message IDs array is required' });
            }

            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Check if user is a participant
            if (!DirectChatController.isUserParticipant(chat, userId)) {
                return res.status(403).json({ error: 'Access denied to this chat' });
            }

            // Mark messages as read
            const readMessages = [];
            for (const messageId of messageIds) {
                await chat.markAsRead(messageId, userId);
                readMessages.push(messageId);
            }

            // Emit read receipts to other participants
            const roomName = `chat_${chatId}`;
            const readReceipt = {
                chatId,
                messageIds: readMessages,
                userId,
                userName: `${req.user.firstName} ${req.user.lastName}`,
                readAt: new Date()
            };

            realTimeChatService.io?.to(roomName).emit('messages_read', readReceipt);

            res.json({
                success: true,
                readMessages,
                readAt: new Date()
            });

        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ error: 'Failed to mark messages as read' });
        }
    }

    /**
     * Update chat settings
     */
    static async updateChat(req, res) {
        try {
            const { chatId } = req.params;
            const { subject } = req.body;
            const userId = req.user.userId;

            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Check if user is a participant
            if (!DirectChatController.isUserParticipant(chat, userId)) {
                return res.status(403).json({ error: 'Access denied to this chat' });
            }

            // Update subject if provided
            if (subject !== undefined) {
                chat.subject = subject.trim();
            }

            await chat.save();

            // Notify participants about the update
            const roomName = `chat_${chatId}`;
            const updateData = {
                chatId,
                subject: chat.subject,
                updatedBy: userId,
                updatedAt: chat.updatedAt
            };

            realTimeChatService.io?.to(roomName).emit('chat_updated', updateData);

            res.json({
                success: true,
                chat: {
                    _id: chat._id,
                    subject: chat.subject,
                    updatedAt: chat.updatedAt
                }
            });

        } catch (error) {
            console.error('Update chat error:', error);
            res.status(500).json({ error: 'Failed to update chat' });
        }
    }

    /**
     * Delete/Archive a chat
     */
    static async deleteChat(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user.userId;

            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Check if user is a participant
            if (!DirectChatController.isUserParticipant(chat, userId)) {
                return res.status(403).json({ error: 'Access denied to this chat' });
            }

            // Mark chat as inactive instead of deleting
            chat.isActive = false;
            await chat.save();

            // Notify participants about chat deletion
            const roomName = `chat_${chatId}`;
            const deleteData = {
                chatId,
                deletedBy: userId,
                deletedAt: new Date()
            };

            realTimeChatService.io?.to(roomName).emit('chat_deleted', deleteData);

            res.json({
                success: true,
                message: 'Chat archived successfully'
            });

        } catch (error) {
            console.error('Delete chat error:', error);
            res.status(500).json({ error: 'Failed to delete chat' });
        }
    }

    /**
     * Get online users
     */
    static async getOnlineUsers(req, res) {
        try {
            const activeUsers = Array.from(realTimeChatService.activeUsers.entries()).map(
                ([userId, userInfo]) => ({
                    userId,
                    name: userInfo.name,
                    role: userInfo.role,
                    status: userInfo.status,
                    lastSeen: userInfo.lastSeen
                })
            );

            res.json({
                success: true,
                onlineUsers: activeUsers,
                count: activeUsers.length
            });

        } catch (error) {
            console.error('Get online users error:', error);
            res.status(500).json({ error: 'Failed to fetch online users' });
        }
    }

    /**
     * Search chats
     */
    static async searchChats(req, res) {
        try {
            const { query, chatType, limit = 20 } = req.query;
            const userId = req.user.userId;

            if (!query || query.trim() === '') {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const searchCriteria = {
                'participants.userId': userId,
                isActive: true,
                $or: [
                    { subject: { $regex: query, $options: 'i' } },
                    { 'messages.content': { $regex: query, $options: 'i' } }
                ]
            };

            if (chatType) {
                searchCriteria.chatType = chatType;
            }

            const chats = await DirectChat.find(searchCriteria)
                .populate('participants.userId', 'firstName lastName email role')
                .populate('propertyId', 'propertyName address')
                .sort({ 'lastMessage.timestamp': -1 })
                .limit(parseInt(limit));

            res.json({
                success: true,
                chats,
                query: query.trim(),
                count: chats.length
            });

        } catch (error) {
            console.error('Search chats error:', error);
            res.status(500).json({ error: 'Failed to search chats' });
        }
    }
}