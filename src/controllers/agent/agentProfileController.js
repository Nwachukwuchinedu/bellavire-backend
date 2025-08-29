import { getAgentByUserId } from "../../services/agent/agentPropertyService.js";
import Agent from "../../models/Agent.js";
import User from "../../models/User.js";

/**
 * Get current agent profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurrentAgent = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID with populated user data
    const agent = await Agent.findOne({ user: userId })
      .populate(
        "user",
        "firstName lastName email phoneNumber profileImage dateOfBirth gender isActive createdAt"
      )
      .lean();

    if (!agent) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Agent profile not found",
        error: "Agent not found",
      });
    }

    // Format agent data
    const formattedAgent = {
      id: agent._id,
      firstName: agent.firstName || agent.user?.firstName,
      lastName: agent.lastName || agent.user?.lastName,
      email: agent.email || agent.user?.email,
      phoneNumber: agent.phoneNumber || agent.user?.phoneNumber,
      profileImage: agent.profileImage || agent.user?.profileImage,
      dateOfBirth: agent.dateOfBirth || agent.user?.dateOfBirth,
      gender: agent.gender || agent.user?.gender,
      city: agent.city,
      country: agent.country,
      address: agent.address,
      company: agent.company,
      description: agent.description,
      governmentIssuedId: agent.governmentIssuedId,
      isActive: agent.user?.isActive,
      createdAt: agent.createdAt || agent.user?.createdAt,
      updatedAt: agent.updatedAt,
    };

    res.status(200).json({
      status: true,
      data: formattedAgent,
      message: "Agent profile retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent profile:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch agent profile",
      error: error.message,
    });
  }
};

/**
 * Update current agent profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateAgent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Find the agent
    const agent = await Agent.findOne({ user: userId });
    if (!agent) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Agent profile not found",
        error: "Agent not found",
      });
    }

    // Fields that can be updated directly on the agent
    const agentFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "city",
      "country",
      "address",
      "company",
      "description",
      "profileImage",
      "dateOfBirth",
      "gender",
    ];

    // Fields that should be updated on the user model
    const userFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "profileImage",
      "dateOfBirth",
      "gender",
    ];

    // Update agent fields
    const agentUpdateData = {};
    agentFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        agentUpdateData[field] = updateData[field];
      }
    });

    if (Object.keys(agentUpdateData).length > 0) {
      Object.assign(agent, agentUpdateData);
      await agent.save();
    }

    // Update user fields if they exist in the update data
    const userUpdateData = {};
    userFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        userUpdateData[field] = updateData[field];
      }
    });

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdateData);
    }

    // Fetch updated agent with populated user data
    const updatedAgent = await Agent.findOne({ user: userId })
      .populate(
        "user",
        "firstName lastName email phoneNumber profileImage dateOfBirth gender isActive createdAt"
      )
      .lean();

    // Format updated agent data
    const formattedAgent = {
      id: updatedAgent._id,
      firstName: updatedAgent.firstName || updatedAgent.user?.firstName,
      lastName: updatedAgent.lastName || updatedAgent.user?.lastName,
      email: updatedAgent.email || updatedAgent.user?.email,
      phoneNumber: updatedAgent.phoneNumber || updatedAgent.user?.phoneNumber,
      profileImage:
        updatedAgent.profileImage || updatedAgent.user?.profileImage,
      dateOfBirth: updatedAgent.dateOfBirth || updatedAgent.user?.dateOfBirth,
      gender: updatedAgent.gender || updatedAgent.user?.gender,
      city: updatedAgent.city,
      country: updatedAgent.country,
      address: updatedAgent.address,
      company: updatedAgent.company,
      description: updatedAgent.description,
      governmentIssuedId: updatedAgent.governmentIssuedId,
      isActive: updatedAgent.user?.isActive,
      createdAt: updatedAgent.createdAt || updatedAgent.user?.createdAt,
      updatedAt: updatedAgent.updatedAt,
    };

    res.status(200).json({
      status: true,
      data: formattedAgent,
      message: "Agent profile updated successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error updating agent profile:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to update agent profile",
      error: error.message,
    });
  }
};
