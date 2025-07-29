import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Contractor:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - email
 *         - specialty
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the contractor
 *         name:
 *           type: string
 *           description: Full name of the contractor
 *         phone:
 *           type: string
 *           description: Phone number of the contractor
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the contractor
 *         specialty:
 *           type: string
 *           description: Area of specialty (e.g., plumbing, electrical, HVAC)
 *         availability:
 *           type: string
 *           enum: [available, busy, unavailable]
 *           default: "available"
 *           description: Current availability status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const contractorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialty: { type: String, required: true },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  }
}, { timestamps: true });

const Contractor = mongoose.model('Contractor', contractorSchema);
export default Contractor; 