import DirectChat from '../models/DirectChat.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { notificationService } from './notificationService.js';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig.js';

class RealTimeChatService {
    constructor() {
        this.activeUsers = new Map(); // Map to store active users and their socket IDs
        this.userRooms = new Map(); // Map to store user's joined rooms
    }

    /**
     * Initialize Socket.IO server
     */
    initializeSocket(io) {
        this.io = io;
        
        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);
            
            // Handle user authentication and joining
            socket.on('authenticate', async (data) => {
                await this.authenticateUser(socket, data);
            });
            
            // Handle joining chat rooms
            socket.on('join_chat', async (data) => {
                await this.joinChatRoom(socket, data);
            });
            
            // Handle leaving chat rooms
            socket.on('leave_chat', async (data) => {
                await this.leaveChatRoom(socket, data);
            });
            
            // Handle sending messages
            socket.on('send_message', async (data) => {
                await this.handleSendMessage(socket, data);
            });
            
            // Handle message read receipts
            socket.on('mark_as_read', async (data) => {
                await this.handleMarkAsRead(socket, data);
            });
            
            // Handle typing indicators
            socket.on('typing_start', (data) => {
                this.handleTypingStart(socket, data);
            });
            
            socket.on('typing_stop', (data) => {
                this.handleTypingStop(socket, data);
            });
            
            // Handle creating new chats
            socket.on('create_chat', async (data) => {
                await this.handleCreateChat(socket, data);
            });
            
            // Handle getting chat history
            socket.on('get_chat_history', async (data) => {
                await this.handleGetChatHistory(socket, data);
            });
            
            // Handle user online status
            socket.on('update_status', (data) => {
                this.updateUserStatus(socket, data);
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
        
        return io;
    }

    /**
     * Authenticate user and store connection info
     */
    async authenticateUser(socket, data) {
        try {
            const { userId, token } = data;
            
            if (!userId || !token) {
                socket.emit('auth_error', { error: 'User ID and token are required' });
                return;
            }
            
            // Verify JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, jwtConfig.JWT_ACCESS_SECRET);
            } catch (jwtError) {
                console.error('JWT verification failed:', jwtError.message);
                socket.emit('auth_error', { error: 'Invalid or expired token' });
                return;
            }
            
            // Ensure the token belongs to the claimed user
            if (decoded.userId !== userId) {
                socket.emit('auth_error', { error: 'Token does not match user ID' });
                return;
            }
            
            // Verify user exists and is active
            const user = await User.findById(userId).select('firstName lastName email role isActive');
            if (!user || !user.isActive) {
                socket.emit('auth_error', { error: 'Invalid user or user is inactive' });
                return;
            }
            
            // Store user connection info
            socket.userId = userId;
            socket.userRole = user.role;
            socket.userName = `${user.firstName} ${user.lastName}`;
            
            this.activeUsers.set(userId, {
                socketId: socket.id,
                role: user.role,
                name: socket.userName,
                status: 'online',
                lastSeen: new Date()
            });
            
            // Join user to their personal room
            socket.join(`user_${userId}`);
            
            // Get user's active chats and join those rooms
            const userChats = await DirectChat.findByParticipant(userId, { limit: 50 });
            const chatRooms = [];
            
            for (const chat of userChats) {
                const roomName = `chat_${chat._id}`;
                socket.join(roomName);
                chatRooms.push({
                    chatId: chat._id,
                    roomName,
                    participants: chat.participants,
                    lastMessage: chat.lastMessage
                });
            }
            
            this.userRooms.set(userId, chatRooms.map(room => room.roomName));
            
            socket.emit('authenticated', {
                success: true,
                user: {
                    id: userId,
                    name: socket.userName,
                    role: user.role
                },
                activeChats: chatRooms
            });
            
            // Notify other users about online status
            this.broadcastUserStatus(userId, 'online');
            
        } catch (error) {
            console.error('Authentication error:', error);
            socket.emit('auth_error', { error: 'Authentication failed' });
        }
    }

    /**
     * Join a specific chat room
     */
    async joinChatRoom(socket, data) {
        try {
            const { chatId } = data;
            const userId = socket.userId;
            
            if (!userId) {
                socket.emit('error', { error: 'User not authenticated' });
                return;
            }
            
            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                socket.emit('error', { error: 'Chat not found' });
                return;
            }
            
            // Check if user is a participant
            // Check if user is a participant - handle both populated and non-populated participants
            const isParticipant = chat.participants.some(p => {
                // Handle populated participants (userId is an object with _id)
                if (p.userId && p.userId._id) {
                    return p.userId._id.toString() === userId;
                }
                // Handle non-populated participants (userId is directly an ObjectId)
                return p.userId.toString() === userId;
            });
            
            if (!isParticipant) {
                socket.emit('error', { error: 'Access denied to this chat' });
                return;
            }
            
            const roomName = `chat_${chatId}`;
            socket.join(roomName);
            
            // Update user's room list
            const userRooms = this.userRooms.get(userId) || [];
            if (!userRooms.includes(roomName)) {
                userRooms.push(roomName);
                this.userRooms.set(userId, userRooms);
            }
            
            socket.emit('joined_chat', {
                chatId,
                roomName,
                participants: chat.participants
            });
            
            // Notify other participants that user joined
            socket.to(roomName).emit('user_joined_chat', {
                chatId,
                user: {
                    id: userId,
                    name: socket.userName,
                    role: socket.userRole
                }
            });
            
        } catch (error) {
            console.error('Join chat room error:', error);
            socket.emit('error', { error: 'Failed to join chat room' });
        }
    }

    /**
     * Leave a specific chat room
     */
    async leaveChatRoom(socket, data) {
        try {
            const { chatId } = data;
            const userId = socket.userId;
            
            const roomName = `chat_${chatId}`;
            socket.leave(roomName);
            
            // Update user's room list
            const userRooms = this.userRooms.get(userId) || [];
            const updatedRooms = userRooms.filter(room => room !== roomName);
            this.userRooms.set(userId, updatedRooms);
            
            socket.emit('left_chat', { chatId });
            
            // Notify other participants that user left
            socket.to(roomName).emit('user_left_chat', {
                chatId,
                user: {
                    id: userId,
                    name: socket.userName,
                    role: socket.userRole
                }
            });
            
        } catch (error) {
            console.error('Leave chat room error:', error);
            socket.emit('error', { error: 'Failed to leave chat room' });
        }
    }

    /**
     * Handle sending messages
     */
    async handleSendMessage(socket, data) {
        try {
            const { chatId, content, messageType = 'text', attachments = [] } = data;
            const userId = socket.userId;
            const userRole = socket.userRole;
            
            if (!userId) {
                socket.emit('error', { error: 'User not authenticated' });
                return;
            }
            
            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                socket.emit('error', { error: 'Chat not found' });
                return;
            }
            
            // Check if user is a participant
            // Check if user is a participant - handle both populated and non-populated participants
            const isParticipant = chat.participants.some(p => {
                // Handle populated participants (userId is an object with _id)
                if (p.userId && p.userId._id) {
                    return p.userId._id.toString() === userId;
                }
                // Handle non-populated participants (userId is directly an ObjectId)
                return p.userId.toString() === userId;
            });
            
            if (!isParticipant) {
                socket.emit('error', { error: 'Access denied to this chat' });
                return;
            }
            
            // Add message to chat
            const messageData = {
                senderId: userId,
                senderRole: userRole,
                content,
                messageType,
                attachments
            };
            
            await chat.addMessage(messageData);
            
            // Get the newly added message
            const newMessage = chat.messages[chat.messages.length - 1];
            
            const messageResponse = {
                chatId,
                messageId: newMessage._id,
                senderId: userId,
                senderName: socket.userName,
                senderRole: userRole,
                content,
                messageType,
                attachments,
                timestamp: newMessage.timestamp
            };
            
            // Emit to all participants in the chat room
            const roomName = `chat_${chatId}`;
            this.io.to(roomName).emit('new_message', messageResponse);
            
            // Send push notifications to offline participants
            await this.sendNotificationsToOfflineUsers(chat, messageResponse);
            
        } catch (error) {
            console.error('Send message error:', error);
            socket.emit('error', { error: 'Failed to send message' });
        }
    }

    /**
     * Handle mark as read
     */
    async handleMarkAsRead(socket, data) {
        try {
            const { chatId, messageId } = data;
            const userId = socket.userId;
            
            const chat = await DirectChat.findById(chatId);
            if (!chat) {
                socket.emit('error', { error: 'Chat not found' });
                return;
            }
            
            await chat.markAsRead(messageId, userId);
            
            // Notify other participants about read receipt
            const roomName = `chat_${chatId}`;
            socket.to(roomName).emit('message_read', {
                chatId,
                messageId,
                userId,
                userName: socket.userName
            });
            
        } catch (error) {
            console.error('Mark as read error:', error);
            socket.emit('error', { error: 'Failed to mark message as read' });
        }
    }

    /**
     * Handle typing indicators
     */
    handleTypingStart(socket, data) {
        const { chatId } = data;
        const userId = socket.userId;
        
        if (!userId) return;
        
        const roomName = `chat_${chatId}`;
        socket.to(roomName).emit('user_typing', {
            chatId,
            userId,
            userName: socket.userName,
            isTyping: true
        });
    }

    handleTypingStop(socket, data) {
        const { chatId } = data;
        const userId = socket.userId;
        
        if (!userId) return;
        
        const roomName = `chat_${chatId}`;
        socket.to(roomName).emit('user_typing', {
            chatId,
            userId,
            userName: socket.userName,
            isTyping: false
        });
    }

    /**
     * Handle creating new chats
     */
    async handleCreateChat(socket, data) {
        try {
            const { participantId, propertyId, subject } = data;
            const userId = socket.userId;
            const userRole = socket.userRole;
            
            if (!userId) {
                socket.emit('error', { error: 'User not authenticated' });
                return;
            }
            
            // Get participant details
            const participant = await User.findById(participantId).select('firstName lastName role');
            if (!participant) {
                socket.emit('error', { error: 'Participant not found' });
                return;
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
            
            const roomName = `chat_${chat._id}`;
            
            // Add both participants to the room
            socket.join(roomName);
            
            // If participant is online, add them to room too
            const participantSocket = this.getSocketByUserId(participantId);
            if (participantSocket) {
                participantSocket.join(roomName);
            }
            
            // Update room lists
            const userRooms = this.userRooms.get(userId) || [];
            if (!userRooms.includes(roomName)) {
                userRooms.push(roomName);
                this.userRooms.set(userId, userRooms);
            }
            
            const chatData = {
                chatId: chat._id,
                participants: chat.participants,
                subject: chat.subject,
                chatType: chat.chatType,
                propertyId: chat.propertyId,
                createdAt: chat.createdAt
            };
            
            // Notify both participants
            socket.emit('chat_created', chatData);
            if (participantSocket) {
                participantSocket.emit('new_chat_request', chatData);
            }
            
        } catch (error) {
            console.error('Create chat error:', error);
            socket.emit('error', { error: 'Failed to create chat' });
        }
    }

    /**
     * Handle getting chat history
     */
    async handleGetChatHistory(socket, data) {
        try {
            const { chatId, limit = 50, before } = data;
            const userId = socket.userId;
            
            const chat = await DirectChat.findById(chatId)
                .populate('participants.userId', 'firstName lastName role')
                .populate('propertyId', 'propertyName address');
            
            if (!chat) {
                socket.emit('error', { error: 'Chat not found' });
                return;
            }
            
            // Check if user is a participant - handle both populated and non-populated participants
            const isParticipant = chat.participants.some(p => {
                // Handle populated participants (userId is an object with _id)
                if (p.userId && p.userId._id) {
                    return p.userId._id.toString() === userId;
                }
                // Handle non-populated participants (userId is directly an ObjectId)
                return p.userId.toString() === userId;
            });
            
            if (!isParticipant) {
                socket.emit('error', { error: 'Access denied to this chat' });
                return;
            }
            
            let messages = chat.messages;
            
            if (before) {
                messages = messages.filter(msg => msg.timestamp < new Date(before));
            }
            
            // Sort by timestamp and limit
            messages = messages
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit)
                .reverse();
            
            socket.emit('chat_history', {
                chatId,
                messages,
                participants: chat.participants,
                subject: chat.subject,
                propertyId: chat.propertyId,
                hasMore: chat.messages.length > messages.length
            });
            
        } catch (error) {
            console.error('Get chat history error:', error);
            socket.emit('error', { error: 'Failed to get chat history' });
        }
    }

    /**
     * Update user online status
     */
    updateUserStatus(socket, data) {
        const { status } = data;
        const userId = socket.userId;
        
        if (!userId) return;
        
        const userInfo = this.activeUsers.get(userId);
        if (userInfo) {
            userInfo.status = status;
            userInfo.lastSeen = new Date();
            this.activeUsers.set(userId, userInfo);
            
            this.broadcastUserStatus(userId, status);
        }
    }

    /**
     * Handle user disconnection
     */
    handleDisconnect(socket) {
        const userId = socket.userId;
        console.log(`User disconnected: ${socket.id}`);
        
        if (userId) {
            // Update user status to offline
            const userInfo = this.activeUsers.get(userId);
            if (userInfo) {
                userInfo.status = 'offline';
                userInfo.lastSeen = new Date();
                this.activeUsers.set(userId, userInfo);
                
                // Remove from active users after a delay (in case of reconnection)
                setTimeout(() => {
                    if (this.activeUsers.get(userId)?.status === 'offline') {
                        this.activeUsers.delete(userId);
                        this.userRooms.delete(userId);
                    }
                }, 30000); // 30 seconds delay
                
                this.broadcastUserStatus(userId, 'offline');
            }
        }
    }

    /**
     * Broadcast user status to relevant participants
     */
    broadcastUserStatus(userId, status) {
        const userRooms = this.userRooms.get(userId) || [];
        
        userRooms.forEach(roomName => {
            this.io.to(roomName).emit('user_status_update', {
                userId,
                status,
                timestamp: new Date()
            });
        });
    }

    /**
     * Send notifications to offline participants
     */
    async sendNotificationsToOfflineUsers(chat, messageData) {
        try {
            const offlineParticipants = [];
            
            for (const participant of chat.participants) {
                const userId = participant.userId.toString();
                const isOnline = this.activeUsers.has(userId);
                
                if (!isOnline && userId !== messageData.senderId.toString()) {
                    offlineParticipants.push(participant);
                }
            }
            
            // Send notifications to offline users
            for (const participant of offlineParticipants) {
                await notificationService.createNotification({
                    userId: participant.userId,
                    userRole: participant.role,
                    type: 'new_message',
                    title: 'New Message',
                    message: `New message from ${messageData.senderName}`,
                    data: {
                        chatId: messageData.chatId,
                        senderId: messageData.senderId,
                        senderName: messageData.senderName,
                        messageContent: messageData.content.substring(0, 100)
                    }
                });
            }
            
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    }

    /**
     * Get socket by user ID
     */
    getSocketByUserId(userId) {
        const userInfo = this.activeUsers.get(userId);
        if (userInfo) {
            return this.io.sockets.sockets.get(userInfo.socketId);
        }
        return null;
    }

    /**
     * Get active users count
     */
    getActiveUsersCount() {
        return this.activeUsers.size;
    }

    /**
     * Get user's active chats
     */
    async getUserActiveChats(userId) {
        return await DirectChat.findByParticipant(userId);
    }

    /**
     * Broadcast message to specific users
     */
    broadcastToUsers(userIds, event, data) {
        userIds.forEach(userId => {
            const socket = this.getSocketByUserId(userId);
            if (socket) {
                socket.emit(event, data);
            }
        });
    }
}

// Create singleton instance
const realTimeChatService = new RealTimeChatService();

export { realTimeChatService, RealTimeChatService };
export default realTimeChatService;