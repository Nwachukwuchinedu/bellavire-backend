import Landlord from "../../models/Landlord.js";
import Property from "../../models/Property.js";
import Room from "../../models/Room.js";
import Agent from "../../models/Agent.js";
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

    // Merge existing property data with new values
    const mergedData = {
      ...existingProperty.toObject(),
      ...req.body,
      frontImage: frontImagePath,
      propertyImages: imagePaths,
    };

    // Handle type conversions and arrays
    if (req.body.bedrooms !== undefined)
      mergedData.bedrooms = parseInt(req.body.bedrooms);
    if (req.body.bathrooms !== undefined)
      mergedData.bathrooms = parseInt(req.body.bathrooms);
    if (req.body.furnished !== undefined)
      mergedData.furnished = req.body.furnished === "true";
    if (req.body.monthlyRent !== undefined)
      mergedData.monthlyRent = parseFloat(req.body.monthlyRent);
    if (req.body.depositAmount !== undefined)
      mergedData.depositAmount = parseFloat(req.body.depositAmount);
    if (req.body.availableFrom !== undefined)
      mergedData.availableFrom = new Date(req.body.availableFrom);
    if (req.body.propertyType !== undefined) {
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
      mergedData.propertyType = typeValidationUpdate.normalized || selection;
    }
    if (req.body.sharedAreas !== undefined)
      mergedData.sharedAreas = parseMulti(req.body.sharedAreas);
    if (req.body.billsIncluded !== undefined)
      mergedData.billsIncluded = parseMulti(req.body.billsIncluded);

    // Amenities
    if (
      req.body.wifi !== undefined ||
      req.body.electricity !== undefined ||
      req.body.furnishedKitchen !== undefined ||
      req.body.water !== undefined ||
      req.body.gym !== undefined
    ) {
      mergedData.amenities = {
        wifi: req.body.wifi === "true",
        electricity: req.body.electricity === "true",
        furnishedKitchen: req.body.furnishedKitchen === "true",
        water: req.body.water === "true",
        gym: req.body.gym === "true",
      };
    }

    // Remove undefined values
    Object.keys(mergedData).forEach((key) => {
      if (mergedData[key] === undefined) {
        delete mergedData[key];
      }
    });

    // Validate the merged data
    validator.schemaCache.clear();
    const cleanDataForValidation = JSON.parse(JSON.stringify(mergedData));
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

    // Update only the provided fields
    const updatedProperty = await Property.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: true,
      data: updatedProperty,
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

// Assign agent to property
export const assignAgentToProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { agentId } = req.body;

    // Validate required fields
    if (!agentId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Agent ID is required",
        error: "Missing agentId in request body",
      });
    }

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

    // Find the property and ensure it belongs to the landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or you don't have permission to manage it",
        error: null,
      });
    }

    // Verify the agent exists
    const agent = await Agent.findById(agentId).populate(
      "user",
      "firstName lastName email phoneNumber"
    );

    if (!agent) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Agent not found",
        error: "Invalid agent ID",
      });
    }

    // Assign the agent to the property
    property.agent = agentId;
    await property.save();

    // Return updated property with populated agent data
    const updatedProperty = await Property.findById(propertyId)
      .populate("landlord", "firstName lastName email phoneNumber")
      .populate("agent", "firstName lastName email phoneNumber company");

    res.status(200).json({
      status: true,
      data: {
        property: updatedProperty,
        assignedAgent: {
          id: agent._id,
          name: `${agent.user?.firstName || agent.firstName} ${agent.user?.lastName || agent.lastName}`,
          email: agent.user?.email || agent.email,
          phoneNumber: agent.user?.phoneNumber || agent.phoneNumber,
          company: agent.company,
        },
      },
      message: "Agent assigned to property successfully",
      error: null,
    });
  } catch (error) {
    console.error("Assign agent to property error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to assign agent to property",
      error: error.message,
    });
  }
};

// Remove agent from property
export const removeAgentFromProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

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

    // Find the property and ensure it belongs to the landlord
    const property = await Property.findOne({
      _id: propertyId,
      landlord: landlord._id,
    });

    if (!property) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or you don't have permission to manage it",
        error: null,
      });
    }

    // Remove the agent from the property
    const previousAgent = property.agent;
    property.agent = null;
    await property.save();

    // Return updated property
    const updatedProperty = await Property.findById(propertyId)
      .populate("landlord", "firstName lastName email phoneNumber");

    res.status(200).json({
      status: true,
      data: {
        property: updatedProperty,
        removedAgent: previousAgent,
      },
      message: "Agent removed from property successfully",
      error: null,
    });
  } catch (error) {
    console.error("Remove agent from property error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to remove agent from property",
      error: error.message,
    });
  }
};

// Get all available agents for assignment
export const getAvailableAgents = async (req, res) => {
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

    // Get all agents with their user information
    const agents = await Agent.find({})
      .populate(
        "user",
        "firstName lastName email phoneNumber profileImage isActive"
      )
      .lean();

    // Filter only active agents and format the response
    const activeAgents = agents
      .filter((agent) => agent.user?.isActive !== false)
      .map((agent) => ({
        id: agent._id,
        firstName: agent.user?.firstName || agent.firstName,
        lastName: agent.user?.lastName || agent.lastName,
        name: `${agent.user?.firstName || agent.firstName} ${agent.user?.lastName || agent.lastName}`,
        email: agent.user?.email || agent.email,
        phoneNumber: agent.user?.phoneNumber || agent.phoneNumber,
        profileImage: agent.user?.profileImage || agent.profileImage,
        company: agent.company,
        description: agent.description,
        isActive: agent.user?.isActive !== false,
        createdAt: agent.createdAt,
      }));

    res.status(200).json({
      status: true,
      data: {
        agents: activeAgents,
        total: activeAgents.length,
      },
      message: "Available agents retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Get available agents error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve available agents",
      error: error.message,
    });
  }
};
