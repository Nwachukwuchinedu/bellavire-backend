import Maintenance from "../../models/Maintenance.js";
import Contractor from "../../models/Contractor.js";
import Property from "../../models/Property.js";
import Agent from "../../models/Agent.js";

/**
 * Get all maintenance requests for agent's assigned properties
 * @param {string} agentId - Agent ID
 * @param {Object} options - Filter and pagination options
 * @returns {Object} - Maintenance requests with summary statistics
 */
export const getAgentMaintenanceRequests = async (agentId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    status = "",
    search = "",
    priority = "",
    category = "",
  } = options;

  const skip = (page - 1) * limit;

  // Get agent's properties first
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  if (propertyIds.length === 0) {
    return {
      maintenances: [],
      pagination: {
        current: parseInt(page),
        total: 0,
        count: 0,
        perPage: parseInt(limit),
      },
      summary: {
        totalRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0,
        completedRequests: 0,
        failedRequests: 0,
      },
    };
  }

  // Build filters
  let filters = { propertyId: { $in: propertyIds } };

  if (status && status !== "all") {
    filters.status = status;
  }

  if (category && category !== "all") {
    filters.category = { $regex: category, $options: "i" };
  }

  if (search) {
    filters.$or = [
      { issue: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tenantName: { $regex: search, $options: "i" } },
    ];
  }

  // Get maintenance requests with pagination
  const maintenances = await Maintenance.find(filters)
    .populate("propertyId", "propertyName address addressLine1 cityOrTown")
    .populate("tenant", "firstName lastName email phoneNumber")
    .populate(
      "contractor.contractorId",
      "name phone email specialty availability"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const totalMaintenances = await Maintenance.countDocuments(filters);

  // Calculate summary statistics
  const summary = await calculateAgentMaintenanceSummary(propertyIds);

  return {
    maintenances,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(totalMaintenances / limit),
      count: totalMaintenances,
      perPage: parseInt(limit),
    },
    summary,
  };
};

/**
 * Get maintenance request by ID for agent's properties
 * @param {string} agentId - Agent ID
 * @param {string} maintenanceId - Maintenance request ID
 * @returns {Object} - Maintenance request details
 */
export const getAgentMaintenanceById = async (agentId, maintenanceId) => {
  // Get agent's properties first
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  const maintenance = await Maintenance.findOne({
    _id: maintenanceId,
    propertyId: { $in: propertyIds },
  })
    .populate(
      "propertyId",
      "propertyName address addressLine1 cityOrTown landlord"
    )
    .populate("tenant", "firstName lastName email phoneNumber")
    .populate(
      "contractor.contractorId",
      "name phone email specialty availability"
    )
    .lean();

  if (!maintenance) {
    throw new Error(
      "Maintenance request not found or not in agent's assigned properties"
    );
  }

  return maintenance;
};

/**
 * Update maintenance request status
 * @param {string} agentId - Agent ID
 * @param {string} maintenanceId - Maintenance request ID
 * @param {string} status - New status
 * @returns {Object} - Updated maintenance request
 */
export const updateMaintenanceStatus = async (
  agentId,
  maintenanceId,
  status
) => {
  // Verify the maintenance belongs to agent's properties
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  const maintenance = await Maintenance.findOne({
    _id: maintenanceId,
    propertyId: { $in: propertyIds },
  });

  if (!maintenance) {
    throw new Error(
      "Maintenance request not found or not in agent's assigned properties"
    );
  }

  maintenance.status = status;
  await maintenance.save();

  return await Maintenance.findById(maintenanceId)
    .populate("propertyId", "propertyName address")
    .populate("tenant", "firstName lastName email")
    .populate("contractor.contractorId", "name phone email specialty")
    .lean();
};

/**
 * Assign contractor to maintenance request
 * @param {string} agentId - Agent ID
 * @param {string} maintenanceId - Maintenance request ID
 * @param {string} contractorId - Contractor ID
 * @returns {Object} - Updated maintenance request
 */
export const assignContractorToMaintenance = async (
  agentId,
  maintenanceId,
  contractorId
) => {
  // Verify the maintenance belongs to agent's properties
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  const maintenance = await Maintenance.findOne({
    _id: maintenanceId,
    propertyId: { $in: propertyIds },
  });

  if (!maintenance) {
    throw new Error(
      "Maintenance request not found or not in agent's assigned properties"
    );
  }

  // Verify contractor exists
  const contractor = await Contractor.findById(contractorId);
  if (!contractor) {
    throw new Error("Contractor not found");
  }

  // Assign contractor
  maintenance.contractor = {
    contractorId: contractorId,
    assignedAt: new Date(),
  };

  // Update status to in progress if it was pending
  if (maintenance.status === "pending") {
    maintenance.status = "in progress";
  }

  await maintenance.save();

  return await Maintenance.findById(maintenanceId)
    .populate("propertyId", "propertyName address")
    .populate("tenant", "firstName lastName email")
    .populate("contractor.contractorId", "name phone email specialty")
    .lean();
};

/**
 * Remove contractor from maintenance request
 * @param {string} agentId - Agent ID
 * @param {string} maintenanceId - Maintenance request ID
 * @returns {Object} - Updated maintenance request
 */
export const removeContractorFromMaintenance = async (
  agentId,
  maintenanceId
) => {
  // Verify the maintenance belongs to agent's properties
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  const maintenance = await Maintenance.findOne({
    _id: maintenanceId,
    propertyId: { $in: propertyIds },
  });

  if (!maintenance) {
    throw new Error(
      "Maintenance request not found or not in agent's assigned properties"
    );
  }

  // Remove contractor
  maintenance.contractor = {
    contractorId: null,
    assignedAt: null,
  };

  // Update status back to pending if it was in progress
  if (maintenance.status === "in progress") {
    maintenance.status = "pending";
  }

  await maintenance.save();

  return await Maintenance.findById(maintenanceId)
    .populate("propertyId", "propertyName address")
    .populate("tenant", "firstName lastName email")
    .lean();
};

/**
 * Get all available contractors
 * @param {Object} options - Filter options
 * @returns {Array} - Available contractors
 */
export const getAvailableContractors = async (options = {}) => {
  const { specialty = "", availability = "available" } = options;

  let filters = {};

  if (specialty && specialty !== "all") {
    filters.specialty = { $regex: specialty, $options: "i" };
  }

  if (availability && availability !== "all") {
    filters.availability = availability;
  }

  return await Contractor.find(filters).sort({ name: 1 }).lean();
};

/**
 * Add new contractor
 * @param {Object} contractorData - Contractor information
 * @returns {Object} - Created contractor
 */
export const addContractor = async (contractorData) => {
  const {
    name,
    phone,
    email,
    specialty,
    availability = "available",
  } = contractorData;

  // Check if contractor with email already exists
  const existingContractor = await Contractor.findOne({ email });
  if (existingContractor) {
    throw new Error("Contractor with this email already exists");
  }

  const contractor = new Contractor({
    name,
    phone,
    email,
    specialty,
    availability,
  });

  await contractor.save();
  return contractor.toObject();
};

/**
 * Calculate summary statistics for agent maintenance requests
 * @param {Array} propertyIds - Array of property IDs
 * @returns {Object} - Summary statistics
 */
export const calculateAgentMaintenanceSummary = async (propertyIds) => {
  const totalRequests = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
  });

  const pendingRequests = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: "pending",
  });

  const inProgressRequests = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: "in progress",
  });

  const completedRequests = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: "resolved",
  });

  const failedRequests = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: "failed",
  });

  return {
    totalRequests,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    failedRequests,
  };
};
