import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Lease:
 *       type: object
 *       required:
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
 *         - landlordDetail
 *         - tenantDetail
 *         - propertyDetail
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
 *         landlordDetail:
 *           type: object
 *           required:
 *             - name
 *             - address
 *             - phone
 *             - email
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         tenantDetail:
 *           type: object
 *           required:
 *             - name
 *             - email
 *             - phone
 *             - address
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *         propertyDetail:
 *           type: object
 *           required:
 *             - address
 *             - apartmentNo
 *             - zip
 *             - city
 *             - state
 *           properties:
 *             address:
 *               type: string
 *             apartmentNo:
 *               type: string
 *             zip:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *         leaseDocument:
 *           type: string
 *           description: Lease document (URL or file path)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const leaseSchema = new mongoose.Schema({
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
  landlordDetail: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  tenantDetail: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  propertyDetail: {
    address: { type: String, required: true },
    apartmentNo: { type: String, required: true },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  leaseDocument: { type: String },
}, { timestamps: true });

const Lease = mongoose.model('Lease', leaseSchema);
export default Lease; 