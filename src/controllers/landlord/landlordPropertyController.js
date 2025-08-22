import Landlord from "../../models/Landlord.js";
import Property from "../../models/Property.js";
import Room from "../../models/Room.js";
import validator from "../../validation/dynamicValidateAndSanitize.js";
import { uploads } from "../../utils/fileUtils.js";
import Lease from "../../models/Lease.js"; // Added import for Lease
import {
  validatePropertyTypeSelection,
  getAllowedPropertyTypes,
} from "../../config/propertyOptions.js";

// Helper to normalize multi-select fields coming from form-data.
// Accepts arrays or comma-separated strings and returns a clean array of strings.
const parseMulti = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  }
  return [];
};

// Get all properties with summary
export const getAllProperties = async (req, res) => {
  try {
    // Get landlord first to ensure they exist
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Get all properties for this landlord
    const properties = await Property.find({ landlord: landlord._id });

    // Calculate summary statistics
    const summary = {
      totalProperties: properties.length,
      totalRooms: properties.reduce(
        (sum, property) => sum + property.bedrooms,
        0
      ),
      totalMonthlyRent: properties.reduce(
        (sum, property) => sum + property.monthlyRent,
        0
      ),
      averageMonthlyRent:
        properties.length > 0
          ? properties.reduce(
              (sum, property) => sum + property.monthlyRent,
              0
            ) / properties.length
          : 0,
    };

    // Calculate actual occupied and vacant rooms based on active leases and room status
    let occupiedRooms = 0;
    let vacantRooms = 0;

    // Get all rooms for all properties of this landlord
    const propertyIds = properties.map((property) => property._id);
    const allRooms = await Room.find({ propertyId: { $in: propertyIds } });

    // Count rooms by status
    allRooms.forEach((room) => {
      if (room.status === "occupied") {
        occupiedRooms++;
      } else if (room.status === "available") {
        vacantRooms++;
      }
      // Note: 'reserved' and 'maintenance' rooms are not counted as either occupied or vacant
    });

    // Also check active leases to ensure accuracy
    const activeLeases = await Lease.find({
      propertyId: { $in: propertyIds },
      status: "active",
      isTerminated: { $ne: true },
    });

    // Update occupied rooms count based on active leases
    const leasedRooms = activeLeases.length;
    if (leasedRooms > occupiedRooms) {
      occupiedRooms = leasedRooms;
      vacantRooms = Math.max(0, summary.totalRooms - occupiedRooms);
    }

    summary.occupiedRooms = occupiedRooms;
    summary.vacantRooms = vacantRooms;

    res.json({
      status: true,
      data: {
        properties,
        summary,
      },
      message: "Properties retrieved successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve properties",
      error: err.message,
    });
  }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get landlord first to ensure they exist
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const property = await Property.findOne({
      _id: id,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found",
        error: null,
      });
    }

    res.json({
      status: true,
      data: property,
      message: "Property retrieved successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve property",
      error: err.message,
    });
  }
};

// Create new property
export const createProperty = async (req, res) => {
  try {
    // Get landlord first to ensure they exist
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Handle file uploads
    const imagePaths = [];

    // Handle front image
    let frontImagePath = "";
    if (req.files && req.files.frontImage) {
      try {
        const fileInfo = await uploads(
          req.files.frontImage[0].buffer,
          req.files.frontImage[0].originalname,
          "property"
        );
        frontImagePath = fileInfo.path;
      } catch (error) {
        return res.status(400).json({
          status: false,
          data: null,
          message: `Failed to upload front image: ${error.message}`,
          error: error.message,
        });
      }
    }

    // Handle property images
    if (req.files && req.files.propertyImages) {
      for (const file of req.files.propertyImages) {
        try {
          const fileInfo = await uploads(
            file.buffer,
            file.originalname,
            "property"
          );
          imagePaths.push(fileInfo.path);
        } catch (error) {
          return res.status(400).json({
            status: false,
            data: null,
            message: `Failed to upload property image ${file.originalname}: ${error.message}`,
            error: error.message,
          });
        }
      }
    }

    // Create a completely clean property data object
    let propertyTypeSelection = parseMulti(req.body.propertyType);

    // Validate propertyType selection for conflicts and allowed values
    const typeValidation = validatePropertyTypeSelection(propertyTypeSelection);
    if (!typeValidation.valid) {
      return res.status(400).json({
        status: false,
        data: null,
        message: typeValidation.message,
        error: null,
        meta: { allowedPropertyTypes: getAllowedPropertyTypes() },
      });
    }

    const propertyData = {
      landlord: landlord._id,
      propertyName: req.body.propertyName,
      propertyType: typeValidation.normalized || propertyTypeSelection,
      address: req.body.address,
      frontImage: frontImagePath,
      propertyImages: imagePaths,
      description: req.body.description,
      bedrooms: parseInt(req.body.bedrooms),
      bathrooms: parseInt(req.body.bathrooms),
      furnished: req.body.furnished === "true",
      amenities: {
        wifi: req.body.wifi === "true",
        electricity: req.body.electricity === "true",
        furnishedKitchen: req.body.furnishedKitchen === "true",
        water: req.body.water === "true",
        gym: req.body.gym === "true",
      },
      sharedAreas: parseMulti(req.body.sharedAreas),
      billsIncluded: parseMulti(req.body.billsIncluded),
      monthlyRent: parseFloat(req.body.monthlyRent),
      depositAmount: parseFloat(req.body.depositAmount),
      tenancy: req.body.tenancy,
      availableFrom: new Date(req.body.availableFrom),
      paymentFrequency: req.body.paymentFrequency,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2 || undefined,
      cityOrTown: req.body.cityOrTown,
      postalCode: req.body.postalCode,
      regionOrCountry: req.body.regionOrCountry,
    };

    // Clear validator cache and create clean data for validation
    validator.schemaCache.clear();
    const cleanDataForValidation = JSON.parse(JSON.stringify(propertyData));

    // Validate the data
    const { value, error } = validator.validateForCreate(
      cleanDataForValidation,
      Property
    );
    if (error) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Validation failed",
        error: error.details,
      });
    }

    const property = new Property(value);
    await property.save();

    res.status(201).json({
      status: true,
      data: property,
      message: "Property created successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to create property",
      error: err.message,
    });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Get landlord first to ensure they exist
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Check if property exists and belongs to landlord
    const existingProperty = await Property.findOne({
      _id: id,
      landlord: landlord._id,
    });

    if (!existingProperty) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found",
        error: null,
      });
    }

    // Handle file uploads
    let frontImagePath = existingProperty.frontImage;
    let imagePaths = [...existingProperty.propertyImages];

    // Handle front image update
    if (req.files && req.files.frontImage) {
      try {
        const fileInfo = await uploads(
          req.files.frontImage[0].buffer,
          req.files.frontImage[0].originalname,
          "property"
        );
        frontImagePath = fileInfo.path;
      } catch (error) {
        return res.status(400).json({
          status: false,
          data: null,
          message: `Failed to upload front image: ${error.message}`,
          error: error.message,
        });
      }
    }

    // Handle property images update
    if (req.files && req.files.propertyImages) {
      for (const file of req.files.propertyImages) {
        try {
          const fileInfo = await uploads(
            file.buffer,
            file.originalname,
            "property"
          );
          imagePaths.push(fileInfo.path);
        } catch (error) {
          return res.status(400).json({
            status: false,
            data: null,
            message: `Failed to upload property image ${file.originalname}: ${error.message}`,
            error: error.message,
          });
        }
      }
    }

    // Prepare update data - simple and direct approach
    const updateData = {};

    // Only add fields that are provided
    if (req.body.propertyName) updateData.propertyName = req.body.propertyName;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.bedrooms) updateData.bedrooms = parseInt(req.body.bedrooms);
    if (req.body.bathrooms) updateData.bathrooms = parseInt(req.body.bathrooms);
    if (req.body.furnished !== undefined)
      updateData.furnished = req.body.furnished === "true";
    if (req.body.monthlyRent)
      updateData.monthlyRent = parseFloat(req.body.monthlyRent);
    if (req.body.depositAmount)
      updateData.depositAmount = parseFloat(req.body.depositAmount);
    if (req.body.tenancy) updateData.tenancy = req.body.tenancy;
    if (req.body.paymentFrequency)
      updateData.paymentFrequency = req.body.paymentFrequency;
    if (req.body.availableFrom)
      updateData.availableFrom = new Date(req.body.availableFrom);
    if (req.body.addressLine1) updateData.addressLine1 = req.body.addressLine1;
    if (req.body.addressLine2 !== undefined)
      updateData.addressLine2 = req.body.addressLine2 || undefined;
    if (req.body.cityOrTown) updateData.cityOrTown = req.body.cityOrTown;
    if (req.body.postalCode) updateData.postalCode = req.body.postalCode;
    if (req.body.regionOrCountry)
      updateData.regionOrCountry = req.body.regionOrCountry;

    // Arrays
    if (req.body.propertyType) {
      const selection = parseMulti(req.body.propertyType);
      const typeValidationUpdate = validatePropertyTypeSelection(selection);
      if (!typeValidationUpdate.valid) {
        return res.status(400).json({
          status: false,
          data: null,
          message: typeValidationUpdate.message,
          error: null,
          meta: { allowedPropertyTypes: getAllowedPropertyTypes() },
        });
      }
      updateData.propertyType = typeValidationUpdate.normalized || selection;
    }
    if (req.body.sharedAreas) {
      updateData.sharedAreas = parseMulti(req.body.sharedAreas);
    }
    if (req.body.billsIncluded) {
      updateData.billsIncluded = parseMulti(req.body.billsIncluded);
    }

    // Amenities
    if (
      req.body.wifi !== undefined ||
      req.body.electricity !== undefined ||
      req.body.furnishedKitchen !== undefined ||
      req.body.water !== undefined ||
      req.body.gym !== undefined
    ) {
      updateData.amenities = {
        wifi: req.body.wifi === "true",
        electricity: req.body.electricity === "true",
        furnishedKitchen: req.body.furnishedKitchen === "true",
        water: req.body.water === "true",
        gym: req.body.gym === "true",
      };
    }

    // Files
    updateData.frontImage = frontImagePath;
    updateData.propertyImages = imagePaths;

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Clear validator cache and create clean data for validation
    validator.schemaCache.clear();
    const cleanDataForValidation = JSON.parse(JSON.stringify(updateData));

    // Validate the data
    const { value, error } = validator.validateForUpdate(
      cleanDataForValidation,
      Property
    );
    if (error) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Validation failed",
        error: error.details,
      });
    }

    const property = await Property.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: true,
      data: property,
      message: "Property updated successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to update property",
      error: err.message,
    });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Get landlord first to ensure they exist
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Check if property exists and belongs to landlord
    const property = await Property.findOne({
      _id: id,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found",
        error: null,
      });
    }

    await Property.findByIdAndDelete(id);

    res.json({
      status: true,
      data: null,
      message: "Property deleted successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to delete property",
      error: err.message,
    });
  }
};

// Search properties with filters
export const searchProperties = async (req, res) => {
  try {
    const landlord = await Landlord.findOne({ user: req.user.userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Extract query parameters
    const { search, minRent, maxRent, occupation, date } = req.query;

    // Build filter object
    const filter = { landlord: landlord._id };

    // Search term filter
    if (search) {
      filter.$or = [
        { propertyName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { cityOrTown: { $regex: search, $options: "i" } },
        { postalCode: { $regex: search, $options: "i" } },
      ];
    }

    // Rent range filter
    if (minRent || maxRent) {
      filter.monthlyRent = {};
      if (minRent) filter.monthlyRent.$gte = parseFloat(minRent);
      if (maxRent) filter.monthlyRent.$lte = parseFloat(maxRent);
    }

    // Date filter
    if (date) {
      filter.availableFrom = { $gte: new Date(date) };
    }

    // Occupation filter - implement proper logic based on room occupancy and active leases
    if (occupation && occupation !== "all") {
      // Get all properties first to check their occupancy
      const allProperties = await Property.find({ landlord: landlord._id });
      const propertyIds = allProperties.map((property) => property._id);

      let occupiedPropertyIds = [];

      if (occupation === "occupied") {
        // Find properties with occupied rooms or active leases
        const occupiedRooms = await Room.find({
          propertyId: { $in: propertyIds },
          status: "occupied",
        });

        const activeLeases = await Lease.find({
          propertyId: { $in: propertyIds },
          status: "active",
          isTerminated: { $ne: true },
        });

        // Combine room-based and lease-based occupied properties
        const roomOccupiedIds = occupiedRooms.map((room) =>
          room.propertyId.toString()
        );
        const leaseOccupiedIds = activeLeases.map((lease) =>
          lease.propertyId.toString()
        );
        occupiedPropertyIds = [
          ...new Set([...roomOccupiedIds, ...leaseOccupiedIds]),
        ];

        // Filter to only occupied properties
        filter._id = { $in: occupiedPropertyIds };
      } else if (occupation === "vacant") {
        // Find properties with only available rooms and no active leases
        const occupiedRooms = await Room.find({
          propertyId: { $in: propertyIds },
          status: "occupied",
        });

        const activeLeases = await Lease.find({
          propertyId: { $in: propertyIds },
          status: "active",
          isTerminated: { $ne: true },
        });

        // Get IDs of occupied properties
        const roomOccupiedIds = occupiedRooms.map((room) =>
          room.propertyId.toString()
        );
        const leaseOccupiedIds = activeLeases.map((lease) =>
          lease.propertyId.toString()
        );
        const allOccupiedIds = [
          ...new Set([...roomOccupiedIds, ...leaseOccupiedIds]),
        ];

        // Filter to only vacant properties (not in occupied list)
        filter._id = { $nin: allOccupiedIds };
      }
    }

    // Execute query
    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.json({
      status: true,
      data: properties,
      message: "Properties retrieved successfully",
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve properties",
      error: err.message,
    });
  }
};

// Get all rooms for a property
export const getPropertyRooms = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Verify the property belongs to this landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or access denied",
        error: null,
      });
    }

    // Get all rooms for the property
    const rooms = await Room.find({ propertyId }).sort({
      floor: 1,
      roomNumber: 1,
    });

    res.json({
      status: true,
      data: {
        property: {
          id: property._id,
          name: property.propertyName,
          address: property.address,
        },
        rooms,
      },
      message: "Property rooms retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Get property rooms error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve property rooms",
      error: error.message,
    });
  }
};

// Add a new room to a property
export const addRoomToProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { floor, roomNumber, rent, status = "available" } = req.body;

    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Verify the property belongs to this landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or access denied",
        error: null,
      });
    }

    // Validate required fields
    if (!floor || !roomNumber || !rent) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Floor, room number, and rent are required",
        error: null,
      });
    }

    // Create room identifier
    const roomIdentifier = `Floor ${floor}/Rm ${roomNumber}`;

    // Check if room already exists
    const existingRoom = await Room.findOne({
      propertyId,
      roomIdentifier,
    });

    if (existingRoom) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Room already exists with this floor and room number",
        error: null,
      });
    }

    // Create new room
    const newRoom = new Room({
      propertyId,
      floor,
      roomNumber,
      roomIdentifier,
      rent: parseFloat(rent),
      status,
    });

    await newRoom.save();

    res.status(201).json({
      status: true,
      data: newRoom,
      message: "Room added successfully",
      error: null,
    });
  } catch (error) {
    console.error("Add room error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to add room",
      error: error.message,
    });
  }
};

// Update a room
export const updateRoom = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const { floor, roomNumber, rent, status } = req.body;

    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Verify the property belongs to this landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or access denied",
        error: null,
      });
    }

    // Find the room and verify it belongs to the property
    const room = await Room.findOne({
      _id: roomId,
      propertyId,
    });

    if (!room) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Room not found",
        error: null,
      });
    }

    // Prepare update data
    const updateData = {};
    if (floor !== undefined) updateData.floor = floor;
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (rent !== undefined) updateData.rent = parseFloat(rent);
    if (status !== undefined) updateData.status = status;

    // If floor or room number is being updated, check for conflicts
    if (floor || roomNumber) {
      const newFloor = floor || room.floor;
      const newRoomNumber = roomNumber || room.roomNumber;
      const newRoomIdentifier = `Floor ${newFloor}/Rm ${newRoomNumber}`;

      // Check if new identifier conflicts with existing room
      const existingRoom = await Room.findOne({
        propertyId,
        roomIdentifier: newRoomIdentifier,
        _id: { $ne: roomId },
      });

      if (existingRoom) {
        return res.status(400).json({
          status: false,
          data: null,
          message: "Room already exists with this floor and room number",
          error: null,
        });
      }

      updateData.roomIdentifier = newRoomIdentifier;
    }

    // Update the room
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: true,
      data: updatedRoom,
      message: "Room updated successfully",
      error: null,
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to update room",
      error: error.message,
    });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;

    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Verify the property belongs to this landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or access denied",
        error: null,
      });
    }

    // Find the room and verify it belongs to the property
    const room = await Room.findOne({
      _id: roomId,
      propertyId,
    });

    if (!room) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Room not found",
        error: null,
      });
    }

    // Check if room is currently occupied
    if (room.status === "occupied" && room.currentLeaseId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Cannot delete room that is currently occupied",
        error: null,
      });
    }

    // Delete the room
    await Room.findByIdAndDelete(roomId);

    res.json({
      status: true,
      data: null,
      message: "Room deleted successfully",
      error: null,
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

// Get room by ID
export const getRoomById = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;

    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    // Verify the property belongs to this landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or access denied",
        error: null,
      });
    }

    // Find the room and verify it belongs to the property
    const room = await Room.findOne({
      _id: roomId,
      propertyId,
    }).populate("currentLeaseId", "tenantId startDate expirationDate status");

    if (!room) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Room not found",
        error: null,
      });
    }

    res.json({
      status: true,
      data: {
        room,
        property: {
          id: property._id,
          name: property.propertyName,
          address: property.address,
        },
      },
      message: "Room retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Get room by ID error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve room",
      error: error.message,
    });
  }
};
