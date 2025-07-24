import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - propertyName
 *         - propertyType
 *         - address
 *         - frontImage
 *         - propertyImages
 *         - bedrooms
 *         - bathrooms
 *         - furnished
 *         - amenities
 *         - monthlyRent
 *         - depositAmount
 *         - tenancy
 *         - availableFrom
 *         - paymentFrequency
 *         - addressLine1
 *         - cityOrTown
 *         - postalCode
 *         - regionOrCountry
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the property
 *         propertyName:
 *           type: string
 *           description: Name of the property
 *         propertyType:
 *           type: array
 *           items:
 *             type: string
 *             enum: [flat, shared, detached-house, semi-detached]
 *           description: Types of the property
 *         address:
 *           type: string
 *           description: Main address string
 *         frontImage:
 *           type: string
 *           description: URL of the front image
 *         propertyImages:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs of property images
 *         description:
 *           type: string
 *           description: Property description
 *         bedrooms:
 *           type: integer
 *           description: Number of bedrooms
 *         bathrooms:
 *           type: integer
 *           description: Number of bathrooms
 *         furnished:
 *           type: boolean
 *           description: Whether the property is furnished
 *         amenities:
 *           type: object
 *           properties:
 *             wifi:
 *               type: boolean
 *             electricity:
 *               type: boolean
 *             furnishedKitchen:
 *               type: boolean
 *             water:
 *               type: boolean
 *             gym:
 *               type: boolean
 *           description: Amenities available
 *         sharedAreas:
 *           type: array
 *           items:
 *             type: string
 *             enum: [living room, bathroom, kitchen, dining room]
 *           description: Shared areas in the property
 *         monthlyRent:
 *           type: number
 *           description: Monthly rent in pounds
 *         depositAmount:
 *           type: number
 *           description: Deposit amount in pounds
 *         tenancy:
 *           type: string
 *           enum: [monthly, annually]
 *           description: Tenancy type
 *         availableFrom:
 *           type: string
 *           format: date
 *           description: Date the property is available from
 *         paymentFrequency:
 *           type: string
 *           enum: [monthly, weekly, annually]
 *           description: Payment frequency
 *         addressLine1:
 *           type: string
 *           description: Address line 1
 *         addressLine2:
 *           type: string
 *           description: Address line 2
 *         cityOrTown:
 *           type: string
 *           description: City or town
 *         postalCode:
 *           type: string
 *           description: Postal code
 *         regionOrCountry:
 *           type: string
 *           description: Region or country
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 60d0fe4f5311236168a109cf
 *         propertyName: "Modern Shared Flat"
 *         propertyType: ["flat", "shared"]
 *         address: "123 Main St, London, UK"
 *         frontImage: "https://picsum.photos/seed/front1/800/600"
 *         propertyImages:
 *           - "https://picsum.photos/seed/property1_0/800/600"
 *           - "https://picsum.photos/seed/property1_1/800/600"
 *         description: "A beautiful modern shared flat in the city center."
 *         bedrooms: 3
 *         bathrooms: 2
 *         furnished: true
 *         amenities:
 *           wifi: true
 *           electricity: true
 *           furnishedKitchen: true
 *           water: true
 *           gym: false
 *         sharedAreas:
 *           - "living room"
 *           - "kitchen"
 *         monthlyRent: 1200
 *         depositAmount: 1000
 *         tenancy: "monthly"
 *         availableFrom: "2024-07-01"
 *         paymentFrequency: "monthly"
 *         addressLine1: "123 Main St"
 *         addressLine2: "Apt 4B"
 *         cityOrTown: "London"
 *         postalCode: "E1 6AN"
 *         regionOrCountry: "UK"
 *         createdAt: "2024-06-01T10:00:00Z"
 *         updatedAt: "2024-06-01T10:00:00Z"
 */
const propertySchema = new Schema({
    // 1. Property details
    propertyName: { type: String, required: true },
    propertyType: [{
        type: String,
        enum: ['flat', 'shared', 'detached-house', 'semi-detached'],
        required: true
    }],
    address: { type: String, required: true },
    frontImage: { type: String, required: true },
    propertyImages: [{ type: String, required: true }],
    description: { type: String },

    // 2. Property features
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    furnished: { type: Boolean, required: true },
    amenities: {
        wifi: { type: Boolean, default: false },
        electricity: { type: Boolean, default: false },
        furnishedKitchen: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        gym: { type: Boolean, default: false }
    },
    sharedAreas: [{
        type: String,
        enum: ['living room', 'bathroom', 'kitchen', 'dining room']
    }],

    // 3. Rent and availability
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    tenancy: {
        type: String,
        enum: ['monthly', 'annually'],
        required: true
    },
    availableFrom: { type: Date, required: true },
    paymentFrequency: {
        type: String,
        enum: ['monthly', 'weekly', 'annually'],
        required: true
    },

    // 4. Property area
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    cityOrTown: { type: String, required: true },
    postalCode: { type: String, required: true },
    regionOrCountry: { type: String, required: true }
}, { timestamps: true });

const Property = model('Property', propertySchema);
export default Property;
