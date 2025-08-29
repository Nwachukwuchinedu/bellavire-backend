import Property from "../../models/Property.js";
import Agent from "../../models/Agent.js";
import Tenant from "../../models/Tenant.js";
import Room from "../../models/Room.js";

/**
 * Get agent by user ID
 * @param {string} userId - User ID
 * @returns {Object} - Agent object
 */
export const getAgentByUserId = async (userId) => {
  const agent = await Agent.findOne({ user: userId }).populate(
    "user",
    "firstName lastName email"
  );
  if (!agent) {
    throw new Error("Agent not found");
  }
  return agent;
};

/**
 * Get all properties assigned to an agent with filtering options
 * @param {string} agentId - Agent ID
 * @param {Object} options - Filter and pagination options
 * @returns {Object} - Properties with summary statistics
 */
export const getAgentProperties = async (agentId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    propertyType = "",
    status = "",
    cityOrTown = "",
  } = options;

  const skip = (page - 1) * limit;

  // Build search filter
  let searchFilter = {};
  if (search) {
    searchFilter = {
      $or: [
        { propertyName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { addressLine1: { $regex: search, $options: "i" } },
        { addressLine2: { $regex: search, $options: "i" } },
      ],
    };
  }

  // Build filters
  let filters = { agent: agentId };

  if (propertyType && propertyType !== "all") {
    filters.propertyType = { $in: [propertyType] };
  }

  if (cityOrTown && cityOrTown !== "all") {
    filters.cityOrTown = { $regex: cityOrTown, $options: "i" };
  }

  if (status && status !== "all") {
    filters.status = status;
  }

  // Combine filters with search
  const query = { ...filters, ...searchFilter };

  // Get properties with pagination
  const properties = await Property.find(query)
    .populate("landlord", "firstName lastName email phoneNumber")
    .populate("agent", "firstName lastName email phoneNumber company")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const totalProperties = await Property.countDocuments(query);

  // Calculate summary statistics
  const summary = await calculateAgentPropertySummary(agentId);

  return {
    properties,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(totalProperties / limit),
      count: totalProperties,
      perPage: parseInt(limit),
    },
    summary,
  };
};

/**
 * Get property details by ID for an agent
 * @param {string} agentId - Agent ID
 * @param {string} propertyId - Property ID
 * @returns {Object} - Property details
 */
export const getAgentPropertyById = async (agentId, propertyId) => {
  const property = await Property.findOne({ _id: propertyId, agent: agentId })
    .populate("landlord", "firstName lastName email phoneNumber")
    .populate("agent", "firstName lastName email phoneNumber company")
    .lean();

  if (!property) {
    throw new Error("Property not found or not assigned to this agent");
  }

  // Get rooms for this property
  const rooms = await Room.find({ propertyId: propertyId }).lean();

  // Get tenants for this property
  const tenants = await Tenant.find({
    "currentProperty.propertyId": propertyId,
  })
    .select("firstName lastName email phoneNumber")
    .lean();

  return {
    ...property,
    rooms,
    tenants,
  };
};

/**
 * Calculate summary statistics for agent properties
 * @param {string} agentId - Agent ID
 * @returns {Object} - Summary statistics
 */
export const calculateAgentPropertySummary = async (agentId) => {
  const properties = await Property.find({ agent: agentId }).lean();

  const totalProperties = properties.length;
  let totalRooms = 0;
  let occupiedRooms = 0;
  let totalMonthlyRent = 0;

  for (const property of properties) {
    const rooms = await Room.find({ propertyId: property._id }).lean();
    totalRooms += rooms.length;
    occupiedRooms += rooms.filter((room) => room.status === "occupied").length;
    totalMonthlyRent += property.monthlyRent || 0;
  }

  const vacantRooms = totalRooms - occupiedRooms;
  const averageMonthlyRent =
    totalProperties > 0 ? totalMonthlyRent / totalProperties : 0;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  return {
    totalProperties,
    totalRooms,
    occupiedRooms,
    vacantRooms,
    totalMonthlyRent,
    averageMonthlyRent: Math.round(averageMonthlyRent * 100) / 100,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
  };
};

/**
 * Search agent properties with advanced filters
 * @param {string} agentId - Agent ID
 * @param {Object} searchOptions - Search and filter options
 * @returns {Array} - Filtered properties
 */
export const searchAgentProperties = async (agentId, searchOptions = {}) => {
  const {
    search = "",
    minRent = 0,
    maxRent = Number.MAX_SAFE_INTEGER,
    occupation = "all",
    date = null,
  } = searchOptions;

  let filters = { agent: agentId };

  // Search filter
  if (search) {
    filters.$or = [
      { propertyName: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
      { addressLine1: { $regex: search, $options: "i" } },
      { cityOrTown: { $regex: search, $options: "i" } },
      { postalCode: { $regex: search, $options: "i" } },
    ];
  }

  // Rent range filter
  if (minRent > 0 || maxRent < Number.MAX_SAFE_INTEGER) {
    filters.monthlyRent = {
      $gte: minRent,
      $lte: maxRent,
    };
  }

  // Date filter
  if (date) {
    filters.availableFrom = { $lte: new Date(date) };
  }

  let properties = await Property.find(filters)
    .populate("landlord", "firstName lastName email phoneNumber")
    .populate("agent", "firstName lastName email phoneNumber company")
    .sort({ createdAt: -1 })
    .lean();

  // Apply occupation filter (requires room data)
  if (occupation !== "all") {
    const propertiesWithOccupation = [];

    for (const property of properties) {
      const rooms = await Room.find({ propertyId: property._id }).lean();
      const occupiedRooms = rooms.filter(
        (room) => room.status === "occupied"
      ).length;
      const isOccupied = occupiedRooms > 0;

      if (
        (occupation === "occupied" && isOccupied) ||
        (occupation === "vacant" && !isOccupied)
      ) {
        propertiesWithOccupation.push({
          ...property,
          roomsInfo: {
            total: rooms.length,
            occupied: occupiedRooms,
            vacant: rooms.length - occupiedRooms,
          },
        });
      }
    }

    properties = propertiesWithOccupation;
  }

  return properties;
};
