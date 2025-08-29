import {
  getAgentByUserId,
  getAgentProperties as getPropertiesService,
  getAgentPropertyById as getPropertyByIdService,
  searchAgentProperties as searchPropertiesService,
} from "../../services/agent/agentPropertyService.js";

/**
 * Get all properties assigned to the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentProperties = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      propertyType = "",
      status = "",
      cityOrTown = "",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      propertyType,
      status,
      cityOrTown,
    };

    const result = await getPropertiesService(agent._id, options);

    res.status(200).json({
      status: true,
      data: result,
      message: "Agent properties retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent properties:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch agent properties",
      error: error.message,
    });
  }
};

/**
 * Get a specific property by ID assigned to the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentPropertyById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Property ID is required",
        error: "Missing property ID",
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const property = await getPropertyByIdService(agent._id, propertyId);

    res.status(200).json({
      status: true,
      data: property,
      message: "Property retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent property:", error);
    if (error.message === "Property not found or not assigned to this agent") {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Property not found or not assigned to this agent",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch property",
      error: error.message,
    });
  }
};

/**
 * Search properties assigned to the current agent with advanced filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchAgentProperties = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Extract search parameters
    const {
      search = "",
      minRent = 0,
      maxRent = Number.MAX_SAFE_INTEGER,
      occupation = "all",
      date = null,
    } = req.query;

    const searchOptions = {
      search,
      minRent: parseFloat(minRent),
      maxRent: parseFloat(maxRent),
      occupation,
      date,
    };

    const properties = await searchPropertiesService(agent._id, searchOptions);

    res.status(200).json({
      status: true,
      data: properties,
      message: "Properties search completed successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error searching agent properties:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to search properties",
      error: error.message,
    });
  }
};
