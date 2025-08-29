import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Maintenance:
 *       type: object
 *       required:
 *         - issue
 *         - category
 *         - tenant
 *         - landlord
 *         - property
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the maintenance request
 *         issue:
 *           type: string
 *           description: Short issue summary
 *         category:
 *           type: string
 *           description: Category of the maintenance
 *         description:
 *           type: string
 *           description: Detailed description
 *         status:
 *           type: string
 *           enum: [resolved, in progress, pending]
 *           description: Status of the maintenance request
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs/paths
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId reference
 *         landlord:
 *           type: string
 *           description: Landlord ObjectId reference
 *         property:
 *           type: string
 *           description: Property ObjectId reference
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const maintenanceSchema = new mongoose.Schema({
  issue: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['resolved', 'in progress', 'pending'],
    default: 'pending'
  },
  images: [{ type: String, default: [] }],
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true }
}, { timestamps: true });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance; 