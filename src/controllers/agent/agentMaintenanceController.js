import { getAgentByUserId } from "../../services/agent/agentPropertyService.js";
import {
  getAgentMaintenanceRequests as getMaintenanceRequestsService,
  getAgentMaintenanceById as getMaintenanceByIdService,
  updateMaintenanceStatus as updateStatusService,
  assignContractorToMaintenance as assignContractorService,
  removeContractorFromMaintenance as removeContractorService,
  getAvailableContractors as getContractorsService,
  addContractor as addContractorService,
} from "../../services/agent/agentMaintenanceService.js";

/**
 * Get all maintenance requests for agent's assigned properties
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentMaintenanceRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      status = "",
      search = "",
      priority = "",
      category = "",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      priority,
      category,
    };

    const result = await getMaintenanceRequestsService(agent._id, options);

    res.status(200).json({
      status: true,
      data: result,
      message: "Agent maintenance requests retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent maintenance requests:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch maintenance requests",
      error: error.message,
    });
  }
};

/**
 * Get a specific maintenance request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentMaintenanceById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { maintenanceId } = req.params;

    if (!maintenanceId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Maintenance ID is required",
        error: "Missing maintenance ID",
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const maintenance = await getMaintenanceByIdService(
      agent._id,
      maintenanceId
    );

    res.status(200).json({
      status: true,
      data: maintenance,
      message: "Maintenance request retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent maintenance:", error);
    if (
      error.message ===
      "Maintenance request not found or not in agent's assigned properties"
    ) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Maintenance request not found or not assigned to this agent",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch maintenance request",
      error: error.message,
    });
  }
};

/**
 * Update maintenance request status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { maintenanceId } = req.params;
    const { status } = req.body;

    if (!maintenanceId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Maintenance ID is required",
        error: "Missing maintenance ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Status is required",
        error: "Missing status",
      });
    }

    // Validate status
    const validStatuses = ["resolved", "in progress", "pending", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Invalid status",
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const updatedMaintenance = await updateStatusService(
      agent._id,
      maintenanceId,
      status
    );

    res.status(200).json({
      status: true,
      data: updatedMaintenance,
      message: "Maintenance request status updated successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    if (
      error.message ===
      "Maintenance request not found or not in agent's assigned properties"
    ) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Maintenance request not found or not assigned to this agent",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to update maintenance status",
      error: error.message,
    });
  }
};

/**
 * Assign contractor to maintenance request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const assignContractorToMaintenance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { maintenanceId } = req.params;
    const { contractorId } = req.body;

    if (!maintenanceId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Maintenance ID is required",
        error: "Missing maintenance ID",
      });
    }

    if (!contractorId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Contractor ID is required",
        error: "Missing contractor ID",
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const updatedMaintenance = await assignContractorService(
      agent._id,
      maintenanceId,
      contractorId
    );

    res.status(200).json({
      status: true,
      data: updatedMaintenance,
      message: "Contractor assigned to maintenance request successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error assigning contractor:", error);
    if (
      error.message ===
      "Maintenance request not found or not in agent's assigned properties"
    ) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Maintenance request not found or not assigned to this agent",
        error: error.message,
      });
    }
    if (error.message === "Contractor not found") {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Contractor not found",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to assign contractor",
      error: error.message,
    });
  }
};

/**
 * Remove contractor from maintenance request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const removeContractorFromMaintenance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { maintenanceId } = req.params;

    if (!maintenanceId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Maintenance ID is required",
        error: "Missing maintenance ID",
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const updatedMaintenance = await removeContractorService(
      agent._id,
      maintenanceId
    );

    res.status(200).json({
      status: true,
      data: updatedMaintenance,
      message: "Contractor removed from maintenance request successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error removing contractor:", error);
    if (
      error.message ===
      "Maintenance request not found or not in agent's assigned properties"
    ) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Maintenance request not found or not assigned to this agent",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to remove contractor",
      error: error.message,
    });
  }
};

/**
 * Get all available contractors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAvailableContractors = async (req, res) => {
  try {
    const { specialty = "", availability = "available" } = req.query;

    const options = {
      specialty,
      availability,
    };

    const contractors = await getContractorsService(options);

    res.status(200).json({
      status: true,
      data: contractors,
      message: "Available contractors retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch contractors",
      error: error.message,
    });
  }
};

/**
 * Add new contractor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addContractor = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      specialty,
      availability = "available",
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !specialty) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Name, phone, email, and specialty are required",
        error: "Missing required fields",
      });
    }

    const contractorData = {
      name,
      phone,
      email,
      specialty,
      availability,
    };

    const contractor = await addContractorService(contractorData);

    res.status(201).json({
      status: true,
      data: contractor,
      message: "Contractor added successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error adding contractor:", error);
    if (error.message === "Contractor with this email already exists") {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Contractor with this email already exists",
        error: error.message,
      });
    }
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to add contractor",
      error: error.message,
    });
  }
};
