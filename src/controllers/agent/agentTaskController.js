import { getAgentByUserId } from "../../services/agent/agentPropertyService.js";
import {
  getAgentTaskOverview as getTaskOverviewService,
  getAgentTasks as getTasksService,
  getAgentDashboardStats as getDashboardStatsService,
} from "../../services/agent/agentTaskService.js";

/**
 * Get task overview for the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentTaskOverview = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const taskOverview = await getTaskOverviewService(agent._id);

    res.status(200).json({
      status: true,
      data: taskOverview,
      message: "Agent task overview retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent task overview:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch task overview",
      error: error.message,
    });
  }
};

/**
 * Get detailed tasks for the current agent with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      category = "all",
      priority = "all",
      status = "all",
      search = "",
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      priority,
      status,
      search,
    };

    const result = await getTasksService(agent._id, options);

    res.status(200).json({
      status: true,
      data: result,
      message: "Agent tasks retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent tasks:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

/**
 * Get comprehensive dashboard statistics for the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    const dashboardStats = await getDashboardStatsService(agent._id);

    res.status(200).json({
      status: true,
      data: dashboardStats,
      message: "Agent dashboard statistics retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent dashboard stats:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};
