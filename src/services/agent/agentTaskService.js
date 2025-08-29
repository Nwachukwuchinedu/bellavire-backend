import Property from "../../models/Property.js";
import Maintenance from "../../models/Maintenance.js";
import TenantApplication from "../../models/TenantApplication.js";
import Tour from "../../models/Tour.js";
import Agent from "../../models/Agent.js";
import Notification from "../../models/Notification.js";

/**
 * Get task overview for an agent
 * @param {string} agentId - Agent ID
 * @returns {Object} - Task overview with counts and priorities
 */
export const getAgentTaskOverview = async (agentId) => {
  // Get agent's properties
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  if (propertyIds.length === 0) {
    return {
      totalTasks: 0,
      highPriorityTasks: 0,
      mediumPriorityTasks: 0,
      lowPriorityTasks: 0,
      overdueTasks: 0,
      completedTasks: 0,
      tasksByCategory: [],
      recentTasks: [],
      upcomingDeadlines: [],
    };
  }

  // Count maintenance requests by status
  const maintenanceTasks = await Maintenance.aggregate([
    { $match: { propertyId: { $in: propertyIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Count tenant applications
  const applicationTasks = await TenantApplication.aggregate([
    { $match: { property: { $in: propertyIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Count tours
  const tourTasks = await Tour.aggregate([
    { $match: { property: { $in: propertyIds } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Calculate task priorities (based on urgency)
  const highPriorityTasks = await calculateHighPriorityTasks(propertyIds);
  const mediumPriorityTasks = await calculateMediumPriorityTasks(propertyIds);
  const lowPriorityTasks = await calculateLowPriorityTasks(propertyIds);

  // Get recent tasks
  const recentTasks = await getRecentTasks(propertyIds, 5);

  // Get upcoming deadlines
  const upcomingDeadlines = await getUpcomingDeadlines(propertyIds, 7);

  // Calculate total and completed tasks
  const totalMaintenanceTasks = maintenanceTasks.reduce(
    (sum, task) => sum + task.count,
    0
  );
  const completedMaintenanceTasks =
    maintenanceTasks.find((task) => task._id === "resolved")?.count || 0;

  const totalApplicationTasks = applicationTasks.reduce(
    (sum, task) => sum + task.count,
    0
  );
  const totalTourTasks = tourTasks.reduce((sum, task) => sum + task.count, 0);

  const totalTasks =
    totalMaintenanceTasks + totalApplicationTasks + totalTourTasks;
  const completedTasks =
    completedMaintenanceTasks +
    (applicationTasks.find((task) => task._id === "approved")?.count || 0) +
    (tourTasks.find((task) => task._id === "completed")?.count || 0);

  return {
    totalTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    overdueTasks: highPriorityTasks, // Overdue tasks are considered high priority
    completedTasks,
    tasksByCategory: [
      {
        category: "Maintenance",
        tasks: maintenanceTasks,
        total: totalMaintenanceTasks,
      },
      {
        category: "Applications",
        tasks: applicationTasks,
        total: totalApplicationTasks,
      },
      {
        category: "Tours",
        tasks: tourTasks,
        total: totalTourTasks,
      },
    ],
    recentTasks,
    upcomingDeadlines,
  };
};

/**
 * Get detailed tasks for an agent with filtering
 * @param {string} agentId - Agent ID
 * @param {Object} options - Filter and pagination options
 * @returns {Object} - Detailed tasks with pagination
 */
export const getAgentTasks = async (agentId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    category = "all",
    priority = "all",
    status = "all",
    search = "",
  } = options;

  const skip = (page - 1) * limit;

  // Get agent's properties
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  let allTasks = [];

  // Get maintenance tasks
  if (category === "all" || category === "maintenance") {
    const maintenanceTasks = await getMaintenanceTasks(propertyIds, {
      status,
      search,
    });
    allTasks = allTasks.concat(
      maintenanceTasks.map((task) => ({
        ...task,
        category: "maintenance",
        priority: getMaintenancePriority(task),
      }))
    );
  }

  // Get application tasks
  if (category === "all" || category === "applications") {
    const applicationTasks = await getApplicationTasks(propertyIds, {
      status,
      search,
    });
    allTasks = allTasks.concat(
      applicationTasks.map((task) => ({
        ...task,
        category: "applications",
        priority: getApplicationPriority(task),
      }))
    );
  }

  // Get tour tasks
  if (category === "all" || category === "tours") {
    const tourTasks = await getTourTasks(propertyIds, { status, search });
    allTasks = allTasks.concat(
      tourTasks.map((task) => ({
        ...task,
        category: "tours",
        priority: getTourPriority(task),
      }))
    );
  }

  // Filter by priority
  if (priority !== "all") {
    allTasks = allTasks.filter((task) => task.priority === priority);
  }

  // Sort by priority and date
  allTasks.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply pagination
  const totalTasks = allTasks.length;
  const paginatedTasks = allTasks.slice(skip, skip + parseInt(limit));

  return {
    tasks: paginatedTasks,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(totalTasks / limit),
      count: totalTasks,
      perPage: parseInt(limit),
    },
  };
};

/**
 * Get agent dashboard statistics
 * @param {string} agentId - Agent ID
 * @returns {Object} - Dashboard statistics
 */
export const getAgentDashboardStats = async (agentId) => {
  // Get agent's properties
  const agentProperties = await Property.find({ agent: agentId })
    .select("_id")
    .lean();
  const propertyIds = agentProperties.map((p) => p._id);

  const taskOverview = await getAgentTaskOverview(agentId);

  // Get recent activity
  const recentActivity = await getRecentActivity(agentId, propertyIds, 10);

  // Get performance metrics
  const performanceMetrics = await getPerformanceMetrics(agentId, propertyIds);

  return {
    taskOverview,
    recentActivity,
    performanceMetrics,
    assignedProperties: agentProperties.length,
  };
};

// Helper functions
const calculateHighPriorityTasks = async (propertyIds) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: { $in: ["pending", "in progress"] },
    createdAt: { $lte: threeDaysAgo },
  });
};

const calculateMediumPriorityTasks = async (propertyIds) => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: { $in: ["pending", "in progress"] },
    createdAt: { $gte: threeDaysAgo, $lte: oneDayAgo },
  });
};

const calculateLowPriorityTasks = async (propertyIds) => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  return await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: { $in: ["pending", "in progress"] },
    createdAt: { $gte: oneDayAgo },
  });
};

const getRecentTasks = async (propertyIds, limit) => {
  const maintenanceTasks = await Maintenance.find({
    propertyId: { $in: propertyIds },
  })
    .populate("propertyId", "propertyName address")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return maintenanceTasks.map((task) => ({
    ...task,
    category: "maintenance",
    title: task.issue,
    priority: getMaintenancePriority(task),
  }));
};

const getUpcomingDeadlines = async (propertyIds, days) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const tours = await Tour.find({
    property: { $in: propertyIds },
    date: { $gte: new Date(), $lte: futureDate },
    status: { $in: ["pending", "confirmed"] },
  })
    .populate("property", "propertyName address")
    .populate("tenant", "firstName lastName")
    .sort({ date: 1 })
    .lean();

  return tours.map((tour) => ({
    ...tour,
    category: "tour",
    title: `Property Tour - ${tour.property?.propertyName}`,
    deadline: tour.date,
    priority: getTourPriority(tour),
  }));
};

const getMaintenanceTasks = async (propertyIds, options) => {
  const { status, search } = options;
  let filters = { propertyId: { $in: propertyIds } };

  if (status !== "all") {
    filters.status = status;
  }

  if (search) {
    filters.$or = [
      { issue: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  return await Maintenance.find(filters)
    .populate("propertyId", "propertyName address")
    .populate("tenant", "firstName lastName")
    .sort({ createdAt: -1 })
    .lean();
};

const getApplicationTasks = async (propertyIds, options) => {
  const { status, search } = options;
  let filters = { property: { $in: propertyIds } };

  if (status !== "all") {
    filters.status = status;
  }

  if (search) {
    filters.$or = [
      { "applicantInfo.firstName": { $regex: search, $options: "i" } },
      { "applicantInfo.lastName": { $regex: search, $options: "i" } },
    ];
  }

  return await TenantApplication.find(filters)
    .populate("property", "propertyName address")
    .populate("tenant", "firstName lastName")
    .sort({ createdAt: -1 })
    .lean();
};

const getTourTasks = async (propertyIds, options) => {
  const { status, search } = options;
  let filters = { property: { $in: propertyIds } };

  if (status !== "all") {
    filters.status = status;
  }

  return await Tour.find(filters)
    .populate("property", "propertyName address")
    .populate("tenant", "firstName lastName")
    .sort({ date: 1 })
    .lean();
};

const getMaintenancePriority = (task) => {
  const daysSinceCreated = Math.floor(
    (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated > 3) return "high";
  if (daysSinceCreated > 1) return "medium";
  return "low";
};

const getApplicationPriority = (task) => {
  const daysSinceCreated = Math.floor(
    (new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceCreated > 7) return "high";
  if (daysSinceCreated > 3) return "medium";
  return "low";
};

const getTourPriority = (task) => {
  const daysUntilTour = Math.floor(
    (new Date(task.date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilTour <= 1) return "high";
  if (daysUntilTour <= 3) return "medium";
  return "low";
};

const getRecentActivity = async (agentId, propertyIds, limit) => {
  // Get recent notifications
  const notifications = await Notification.find({
    recipient: agentId,
    userRole: "agent",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return notifications.map((notification) => ({
    ...notification,
    activityType: "notification",
  }));
};

const getPerformanceMetrics = async (agentId, propertyIds) => {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Maintenance resolution rate
  const thisMonthResolved = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    status: "resolved",
    updatedAt: { $gte: thisMonth },
  });

  const thisMonthTotal = await Maintenance.countDocuments({
    propertyId: { $in: propertyIds },
    createdAt: { $gte: thisMonth },
  });

  const resolutionRate =
    thisMonthTotal > 0 ? (thisMonthResolved / thisMonthTotal) * 100 : 0;

  // Response time (average days to start working on maintenance)
  const inProgressTasks = await Maintenance.find({
    propertyId: { $in: propertyIds },
    status: "in progress",
    updatedAt: { $gte: thisMonth },
  }).lean();

  const avgResponseTime =
    inProgressTasks.length > 0
      ? inProgressTasks.reduce((sum, task) => {
          const responseTime = Math.floor(
            (new Date(task.updatedAt) - new Date(task.createdAt)) /
              (1000 * 60 * 60 * 24)
          );
          return sum + responseTime;
        }, 0) / inProgressTasks.length
      : 0;

  return {
    maintenanceResolutionRate: Math.round(resolutionRate * 100) / 100,
    averageResponseTime: Math.round(avgResponseTime * 100) / 100,
    tasksCompletedThisMonth: thisMonthResolved,
    totalTasksThisMonth: thisMonthTotal,
  };
};
