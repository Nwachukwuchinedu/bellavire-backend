import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganizationInformation:
 *       type: object
 *       required:
 *         - user
 *         - address
 *         - postalCode
 *         - documentIssuedIdFile
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the organization information
 *         user:
 *           type: string
 *           description: Reference to the User
 *         address:
 *           type: string
 *           description: Organization address
 *         postalCode:
 *           type: string
 *           description: Postal code
 *         documentIssuedIdFile:
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
 *         id: 60d0fe4f5311236168a109cc
 *         user: 60d0fe4f5311236168a109ca
 *         address: "123 Main St"
 *         postalCode: "12345"
 *         documentIssuedIdFile:
 *           path: "/uploads/organization/12345.pdf"
 *           type: "pdf"
 *           extension: ".pdf"
 */
const organizationInformationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    documentIssuedIdFile: {
        path: { type: String, required: true },
        type: { type: String, required: true }, // image | video | pdf | other
        extension: { type: String, required: true }
    }
}, { timestamps: true });

const OrganizationInformation = mongoose.model('OrganizationInformation', organizationInformationSchema);
export default OrganizationInformation;
