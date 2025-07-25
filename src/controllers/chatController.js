import chatService from '../services/chatService.js';
import documentService from '../services/documentService.js';
import Chat from '../models/Chat.js';

export class ChatController {
    static async chat(req, res) {
        try {
            const { message, conversationHistory = [], chatId } = req.body;
            const userId = req.user?.userId;
            if (!message) {
                return res.status(400).json({ error: 'Message is required' });
            }
            // Generate response
            const result = await chatService.generateResponse(message, conversationHistory);
            // Save chat to DB (new or append)
            let chatDoc;
            if (chatId) {
                chatDoc = await Chat.findById(chatId);
                if (chatDoc && (!chatDoc.userId || chatDoc.userId.toString() === userId.toString())) {
                    chatDoc.conversation.push(
                        { role: 'user', content: message },
                        { role: 'assistant', content: result.response }
                    );
                    await chatDoc.save();
                } else {
                    return res.status(403).json({ error: 'Unauthorized access to chat' });
                }
            } else {
                chatDoc = new Chat({
                    userId: userId || undefined,
                    conversation: [
                        { role: 'user', content: message },
                        { role: 'assistant', content: result.response }
                    ]
                });
                await chatDoc.save();
            }
            res.json({
                success: true,
                response: result.response,
                sources: result.sources,
                hasRelevantContext: result.hasRelevantContext,
                chatId: chatDoc ? chatDoc._id : undefined
            });
        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ success: false, error: 'Failed to generate response' });
        }
    }

    static async addDocument(req, res) {
        try {
            const { title, content, category, metadata } = req.body;
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required' });
            }
            const documentId = await documentService.addDocument({
                title,
                content,
                category: category || 'general',
                metadata: metadata || {}
            });
            res.json({ success: true, documentId, message: 'Document added successfully' });
        } catch (error) {
            console.error('Document addition error:', error);
            res.status(500).json({ success: false, error: 'Failed to add document' });
        }
    }

    static async getAllDocuments(req, res) {
        try {
            const documents = await documentService.getAllDocuments();
            res.json({ success: true, documents });
        } catch (error) {
            console.error('Error fetching documents:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch documents' });
        }
    }

    static async search(req, res) {
        try {
            const { query, limit = 5 } = req.body;
            const results = await documentService.searchRelevantChunks(query, limit);
            res.json({ success: true, results });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ success: false, error: 'Search failed' });
        }
    }

    static async getChatHistory(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user?.userId;
            const chatDoc = await Chat.findById(chatId);
            if (!chatDoc) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            if (chatDoc.userId && chatDoc.userId.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Unauthorized access to chat' });
            }
            res.json({ success: true, chat: chatDoc });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
        }
    }

    static async getChatHistoryPaginated(req, res) {
        try {
            const { chatId } = req.params;
            const { before, after, limit = 20 } = req.query;
            const userId = req.user?.userId;
            const chatDoc = await Chat.findById(chatId);
            if (!chatDoc) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            if (chatDoc.userId && chatDoc.userId.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Unauthorized access to chat' });
            }
            let messages = chatDoc.conversation.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            let filtered = messages;
            let hasMoreBefore = false;
            let hasMoreAfter = false;
            let paginated = [];
            if (after) {
                // Get messages after the given timestamp
                filtered = messages.filter(m => new Date(m.timestamp) > new Date(after));
                paginated = filtered.slice(0, limit);
                hasMoreAfter = filtered.length > paginated.length;
                // For after, also check if there are older messages
                hasMoreBefore = messages.some(m => new Date(m.timestamp) <= new Date(after));
            } else if (before) {
                // Get messages before the given timestamp
                filtered = messages.filter(m => new Date(m.timestamp) < new Date(before));
                paginated = filtered.slice(-limit);
                hasMoreBefore = filtered.length > paginated.length;
                // For before, also check if there are newer messages
                hasMoreAfter = messages.some(m => new Date(m.timestamp) >= new Date(before));
            } else {
                // Default: get latest N messages
                paginated = messages.slice(-limit);
                hasMoreBefore = messages.length > paginated.length;
                hasMoreAfter = false;
            }
            res.json({
                success: true,
                messages: paginated,
                hasMoreBefore,
                hasMoreAfter
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch paginated chat history' });
        }
    }

    static async getUserChats(req, res) {
        try {
            const userId = req.user?.userId;
            const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
            res.json({ success: true, chats });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch user chats' });
        }
    }
}
