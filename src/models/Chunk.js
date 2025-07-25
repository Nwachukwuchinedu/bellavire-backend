import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Chunk:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         documentId:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         content:
 *           type: string
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *         chunkIndex:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */
const chunkSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    title: { type: String, required: true },
    category: { type: String, default: 'general' },
    content: { type: String, required: true },
    keywords: [{ type: String }],
    embedding: [{ type: Number }],
    chunkIndex: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

chunkSchema.index({ keywords: 1 });
chunkSchema.index({ category: 1 });

const Chunk = mongoose.model('Chunk', chunkSchema);
export default Chunk; 