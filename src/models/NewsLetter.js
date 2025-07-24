/**
 * @swagger
 * components:
 *   schemas:
 *     NewsLetter:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the newsletter subscription
 *         email:
 *           type: string
 *           description: Subscriber's email address
 *       example:
 *         id: 60d0fe4f5311236168a109cf
 *         email: "subscriber@example.com"
 */
import mongoose from 'mongoose';

const newsLetterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true}
}, { timestamps: true });

const NewsLetter = mongoose.model('NewsLetter', newsLetterSchema);
export default NewsLetter;
