import textProcessor from '../utils/textProcessor.js';
import embeddingService from './embeddingService.js';
import Document from '../models/Document.js';
import Chunk from '../models/Chunk.js';

export class DocumentService {
    async addDocument(document) {
        try {
            const { title, content, category, metadata = {} } = document;
            // Store the original document
            const doc = new Document({
                title,
                content,
                category,
                metadata,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await doc.save();
            // Process and store chunks
            const chunks = textProcessor.chunkText(content);
            const chunkPromises = chunks.map(async (chunk, index) => {
                const keywords = textProcessor.extractKeywords(chunk);
                const embedding = await embeddingService.generateEmbedding(chunk);
                return new Chunk({
                    documentId: doc._id,
                    title,
                    category,
                    content: chunk,
                    keywords,
                    embedding,
                    chunkIndex: index,
                    createdAt: new Date()
                }).save();
            });
            await Promise.all(chunkPromises);
            return doc._id;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    }

    async searchRelevantChunks(query, limit = 5) {
        try {
            // Generate embedding for the query
            const queryEmbedding = await embeddingService.generateEmbedding(query);
            const queryKeywords = textProcessor.extractKeywords(query);
            // Get all chunks for similarity calculation
            const allChunks = await Chunk.find({});
            // Calculate similarity scores
            const scoredChunks = allChunks.map(chunk => {
                const embeddingSimilarity = embeddingService.cosineSimilarity(
                    queryEmbedding,
                    chunk.embedding
                );
                // Keyword overlap score
                const keywordOverlap = queryKeywords.filter(keyword =>
                    chunk.keywords.includes(keyword)
                ).length;
                const keywordScore = keywordOverlap / Math.max(queryKeywords.length, 1);
                // Combined score (weighted)
                const finalScore = (embeddingSimilarity * 0.7) + (keywordScore * 0.3);
                return { ...chunk.toObject(), similarity: finalScore };
            });
            // Sort by similarity and return top results
            return scoredChunks
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } catch (error) {
            console.error('Error searching chunks:', error);
            throw error;
        }
    }

    async getAllDocuments() {
        return await Document.find({});
    }

    async deleteDocument(documentId) {
        await Document.deleteOne({ _id: documentId });
        await Chunk.deleteMany({ documentId });
    }
}

const documentService = new DocumentService();
export default documentService;