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
 *         - roomSelection
 *         - paymentStatus
 *         - documents
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
 *           enum: [active, inactive, pending, expired]
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
 *         roomSelection:
 *           type: object
 *           properties:
 *             floor:
 *               type: string
 *               description: Floor number (e.g., "2")
 *             room:
 *               type: string
 *               description: Room number (e.g., "16")
 *             roomIdentifier:
 *               type: string
 *               description: Combined floor/room identifier (e.g., "Floor 2/Rm 16")
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Payment status for the lease
 *         paymentDetails:
 *           type: object
 *           properties:
 *             stripePaymentIntentId:
 *               type: string
 *               description: Stripe payment intent ID
 *             amount:
 *               type: number
 *               description: Payment amount
 *             currency:
 *               type: string
 *               description: Payment currency
 *             paidAt:
 *               type: string
 *               format: date-time
 *               description: When payment was completed
 *         documents:
 *           type: object
 *           properties:
 *             passport:
 *               type: string
 *               description: Passport document file path
 *             driverLicense:
 *               type: string
 *               description: Driver license document file path
 *             utilityBill:
 *               type: string
 *               description: Utility bill document file path
 *             bankLetter:
 *               type: string
 *               description: Bank letter document file path
 *             digitalSignature:
 *               type: string
 *               description: Digital signature file path
 *         leaseDocument:
 *           type: string
 *           description: Generated lease document (URL or file path)
 *         originalLeaseTemplate:
 *           type: string
 *           description: Original lease template uploaded by landlord
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
 *         isRenewal:
 *           type: boolean
 *           description: Whether this is a renewal of an existing lease
 *         originalLeaseId:
 *           type: string
 *           description: Reference to the original lease if this is a renewal
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
    enum: ['active', 'inactive', 'pending', 'expired'],
    required: true,
    default: 'pending'
  },
  currentProperty: { type: String, required: true },
  streetName: { type: String, required: true },
  rent: { type: Number, required: true },
  apartment: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },

  // Room selection
  roomSelection: {
    floor: { type: String, required: true },
    room: { type: String, required: true },
    roomIdentifier: { type: String, required: true }
  },

  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    stripePaymentIntentId: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'usd' },
    paidAt: { type: Date }
  },

  // Document uploads
  documents: {
    passport: { type: String },
    driverLicense: { type: String },
    utilityBill: { type: String },
    bankLetter: { type: String },
    digitalSignature: { type: String }
  },

  leaseDocument: { type: String },
  originalLeaseTemplate: { type: String },
  isTerminated: { type: Boolean, default: false },
  termination: {
    reason: { type: String },
    comment: { type: String },
    terminatedAt: { type: Date }
  },
  isRenewal: { type: Boolean, default: false },
  originalLeaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease' }
}, { timestamps: true });

const Lease = mongoose.model('Lease', leaseSchema);
export default Lease; 