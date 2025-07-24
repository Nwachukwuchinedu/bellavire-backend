/**
 * @swagger
 * components:
 *   schemas:
 *     ContactUs:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phoneNumber
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the contact message
 *         fullName:
 *           type: string
 *           description: Full name of the sender
 *         email:
 *           type: string
 *           description: Email address of the sender
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the sender
 *         message:
 *           type: string
 *           description: The message content
 *       example:
 *         id: 60d0fe4f5311236168a109cf
 *         fullName: "John Doe"
 *         email: "john@example.com"
 *         phoneNumber: "+1234567890"
 *         message: "I am interested in your services."
 */
import mongoose from 'mongoose';

const contactUsSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true }
}, { timestamps: true });

const ContactUs = mongoose.model('ContactUs', contactUsSchema);
export default ContactUs;
