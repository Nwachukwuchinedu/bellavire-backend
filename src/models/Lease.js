import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Lease:
 *       type: object
 *       required:
 *         - tenantId
 *         - landlordId
 *         - propertyId
 *         - startDate
 *         - expirationDate
 *         - duration
 *         - status
 *         - currentProperty
 *         - streetName
 *         - rent
 *         - apartment
 *         - city
 *         - zipCode

 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the lease
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Lease start date
 *         expirationDate:
 *           type: string
 *           format: date-time
 *           description: Lease expiration date
 *         duration:
 *           type: string
 *           description: Duration of the lease (e.g., 12 months)
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Status of the lease
 *         currentProperty:
 *           type: string
 *           description: Current property name or ID
 *         streetName:
 *           type: string
 *           description: Street name of the property
 *         rent:
 *           type: number
 *           description: Rent amount per month
 *         apartment:
 *           type: string
 *           description: Apartment number or name
 *         city:
 *           type: string
 *           description: City
 *         zipCode:
 *           type: string
 *           description: Zip code

 *         tenantId:
 *           type: string
 *           description: Tenant ObjectId reference
 *         landlordId:
 *           type: string
 *           description: Landlord ObjectId reference
 *         propertyId:
 *           type: string
 *           description: Property ObjectId reference


 *         leaseDocument:
 *           type: string
 *           description: Lease document (URL or file path)
 *         isTerminated:
 *           type: boolean
 *           description: Whether the lease has been terminated
 *         termination:
 *           type: object
 *           properties:
 *             reason:
 *               type: string
 *             comment:
 *               type: string
 *             terminatedAt:
 *               type: string
 *               format: date-time
 *           description: Termination details (do not include when posting a lease)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const leaseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landlord', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  startDate: { type: Date, required: true },
  expirationDate: { type: Date, required: true },
  duration: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    required: true,
    default: 'active'
  },
  currentProperty: { type: String, required: true },
  streetName: { type: String, required: true },
  rent: { type: Number, required: true },
  apartment: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },

  leaseDocument: { type: String },
  isTerminated: { type: Boolean, default: false },
  termination: {
    reason: { type: String },
    comment: { type: String },
    terminatedAt: { type: Date }
  },
}, { timestamps: true });

const Lease = mongoose.model('Lease', leaseSchema);
export default Lease; 