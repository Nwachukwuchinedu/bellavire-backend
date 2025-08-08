import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - propertyId
 *         - floor
 *         - roomNumber
 *         - roomIdentifier
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the room
 *         propertyId:
 *           type: string
 *           description: Property ObjectId reference
 *         floor:
 *           type: string
 *           description: Floor number
 *         roomNumber:
 *           type: string
 *           description: Room number
 *         roomIdentifier:
 *           type: string
 *           description: Combined floor/room identifier (e.g., "Floor 2/Rm 16")
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
 *           description: Room availability status
 *         currentLeaseId:
 *           type: string
 *           description: Current active lease for this room
 *         rent:
 *           type: number
 *           description: Rent amount for this specific room

 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const roomSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  roomIdentifier: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  currentLeaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease'
  },
  rent: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Create compound index for property and room identifier
roomSchema.index({ propertyId: 1, roomIdentifier: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
export default Room; 