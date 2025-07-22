import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     IndividualInformation:
 *       type: object
 *       required:
 *         - user
 *         - address
 *         - postalCode
 *         - file
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the individual information
 *         user:
 *           type: string
 *           description: Reference to the User
 *         address:
 *           type: string
 *           description: Individual address
 *         postalCode:
 *           type: string
 *           description: Postal code
 *         file:
 *           type: object
 *           properties:
 *             path:
 *               type: string
 *               description: File path
 *             type:
 *               type: string
 *               description: File type (image, video, pdf, other)
 *             extension:
 *               type: string
 *               description: File extension
 *       example:
 *         id: 60d0fe4f5311236168a109ce
 *         user: 60d0fe4f5311236168a109ca
 *         address: "456 Main St"
 *         postalCode: "54321"
 *         file:
 *           path: "/uploads/personal/54321.pdf"
 *           type: "pdf"
 *           extension: ".pdf"
 */
const personalInformationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    file: {
        path: { type: String, required: true },
        type: { type: String, required: true },
        extension: { type: String, required: true }
    }
}, { timestamps: true });

const PersonalInformation = mongoose.model('PersonalInformation', personalInformationSchema);
export default PersonalInformation;
