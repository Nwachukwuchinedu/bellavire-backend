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
 *         - status
 *         - tenant
 *         - tenantName
 *         - tenantPhoneNumber
 *         - tenantEmail
 *         - landlordId
 *         - propertyId
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
 *         status:
 *           type: string
 *           enum: [resolved, in progress, pending, failed]
 *           description: Status of the maintenance
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs/paths
 *         description:
 *           type: string
 *           description: Detailed description
 *         tenant:
 *           type: string
 *           description: Tenant ObjectId
 *         tenantName:
 *           type: string
 *           description: Full name of the tenant (firstName + lastName)
 *         tenantPhoneNumber:
 *           type: string
 *           description: Tenant phone number
 *         tenantEmail:
 *           type: string
 *           description: Tenant email
 *         landlordId:
 *           type: string
 *           description: Landlord ObjectId
 *         propertyId:
 *           type: string
 *           description: Property ObjectId
 *         landlordName:
 *           type: string
 *           description: Full name of the landlord (firstName + lastName)
 *         propertyAddress:
 *           type: string
 *           description: Address of the property
 *         contractor:
 *           type: object
 *           description: Contractor assignment details
 *           properties:
 *             contractorId:
 *               type: string
 *               description: Contractor ObjectId
 *             assignedAt:
 *               type: string
 *               format: date-time
 *               description: Date when contractor was assigned
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
  status: {
    type: String,
    enum: ['resolved', 'in progress', 'pending', 'failed'],
    required: true,
    default: 'pending'
  },
  images: [{ type: String, default: [] }],
  description: { type: String, default: '' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  tenantName: { type: String, required: true },
  tenantPhoneNumber: { type: String, required: true },
  tenantEmail: { type: String, required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  contractor: {
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor', default: null },
    assignedAt: { type: Date, default: null }
  }
}, { timestamps: true });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance; 