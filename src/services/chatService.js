import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import documentService from './documentService.js';

dotenv.config();

export class ChatService {
    constructor(documentService) {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        this.documentService = documentService;
    }

    async generateResponse(userQuery, conversationHistory = []) {
        try {
            // Retrieve relevant context
            const relevantChunks = await this.documentService.searchRelevantChunks(userQuery, 5);

            // Build context from retrieved chunks
            const context = relevantChunks
                .map(chunk => `[From ${chunk.title}]: ${chunk.content}`)
                .join('\n\n');

            // Create the prompt
            const systemPrompt = `You are a helpful AI assistant that answers questions about our products based on the provided documentation.

IMPORTANT GUIDELINES:
- Do NOT say "the provided documents", "documentation", or similar. Instead, refer to the product by name (e.g., "Smart Home Hub") or answer directly.
- If the context doesn't contain enough information to answer the question, politely say you don't have that specific information.
- Be accurate and specific in your responses.
- Reference the source documents by product name or section when relevant.
- Maintain a helpful and professional tone.
- Format your answers using Markdown (use lists, bold, italics, links, etc. as appropriate).

CONTEXT FROM PRODUCT DOCUMENTATION:
${context}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER QUESTION: ${userQuery}

Please provide a helpful response based on the available context:`;

            const result = await this.model.generateContent(systemPrompt);
            const response = result.response.text();

            // Return response with metadata
            return {
                response,
                sources: relevantChunks.map(chunk => ({
                    title: chunk.title,
                    category: chunk.category,
                    similarity: chunk.similarity.toFixed(3)
                })),
                hasRelevantContext: relevantChunks.length > 0 && relevantChunks[0].similarity > 0.3
            };
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }
}

const chatService = new ChatService(documentService);
export default chatService;