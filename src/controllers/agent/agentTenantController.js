import { getAgentByUserId } from "../../services/agent/agentPropertyService.js";
import Tenant from "../../models/Tenant.js";
import Property from "../../models/Property.js";
import Lease from "../../models/Lease.js";

/**
 * Get all tenants in properties assigned to the current agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentTenants = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Get agent's properties
    const agentProperties = await Property.find({ agent: agent._id })
      .select("_id propertyName address")
      .lean();
    const propertyIds = agentProperties.map((p) => p._id);

    if (propertyIds.length === 0) {
      return res.status(200).json({
        status: true,
        data: {
          tenants: [],
          pagination: {
            current: 1,
            total: 0,
            count: 0,
            perPage: 10,
          },
          summary: {
            totalTenants: 0,
            activeTenants: 0,
            inactiveTenants: 0,
          },
        },
        message: "No tenants found - no properties assigned to agent",
        error: null,
      });
    }

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      propertyId = "",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Build filters for tenants in agent's properties
    let filters = {
      "currentProperty.propertyId": { $in: propertyIds },
    };

    // Add property filter if specified
    if (propertyId && propertyId !== "all") {
      filters["currentProperty.propertyId"] = propertyId;
    }

    // Add status filter if specified
    if (status !== "all") {
      filters.isActive = status === "active";
    }

    // Combine filters with search
    const query = { ...filters, ...searchFilter };

    // Get tenants with pagination
    const tenants = await Tenant.find(query)
      .populate(
        "user",
        "firstName lastName email phoneNumber profileImage isActive"
      )
      .populate(
        "currentProperty.propertyId",
        "propertyName address addressLine1 cityOrTown"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalTenants = await Tenant.countDocuments(query);

    // Calculate summary statistics
    const totalAgentTenants = await Tenant.countDocuments({
      "currentProperty.propertyId": { $in: propertyIds },
    });

    const activeTenants = await Tenant.countDocuments({
      "currentProperty.propertyId": { $in: propertyIds },
      isActive: true,
    });

    const inactiveTenants = totalAgentTenants - activeTenants;

    // Format tenant data
    const formattedTenants = tenants.map((tenant) => ({
      id: tenant._id,
      firstName: tenant.firstName || tenant.user?.firstName,
      lastName: tenant.lastName || tenant.user?.lastName,
      email: tenant.email || tenant.user?.email,
      phoneNumber: tenant.phoneNumber || tenant.user?.phoneNumber,
      profileImage: tenant.profileImage || tenant.user?.profileImage,
      isActive:
        tenant.isActive !== undefined ? tenant.isActive : tenant.user?.isActive,
      currentProperty: tenant.currentProperty,
      propertyDetails: tenant.currentProperty?.propertyId,
      leaseStartDate: tenant.currentProperty?.leaseStartDate,
      leaseEndDate: tenant.currentProperty?.leaseEndDate,
      monthlyRent: tenant.currentProperty?.monthlyRent,
      city: tenant.city,
      country: tenant.country,
      createdAt: tenant.createdAt,
    }));

    res.status(200).json({
      status: true,
      data: {
        tenants: formattedTenants,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalTenants / parseInt(limit)),
          count: totalTenants,
          perPage: parseInt(limit),
        },
        summary: {
          totalTenants: totalAgentTenants,
          activeTenants,
          inactiveTenants,
        },
      },
      message: "Agent tenants retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent tenants:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch agent tenants",
      error: error.message,
    });
  }
};

/**
 * Get a specific tenant by ID in agent's assigned properties
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAgentTenantById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Tenant ID is required",
        error: "Missing tenant ID",
      });
    }

    // Get agent by user ID
    const agent = await getAgentByUserId(userId);

    // Get agent's properties
    const agentProperties = await Property.find({ agent: agent._id })
      .select("_id")
      .lean();
    const propertyIds = agentProperties.map((p) => p._id);

    // Find tenant and verify they're in agent's properties
    const tenant = await Tenant.findOne({
      _id: tenantId,
      "currentProperty.propertyId": { $in: propertyIds },
    })
      .populate(
        "user",
        "firstName lastName email phoneNumber profileImage isActive"
      )
      .populate(
        "currentProperty.propertyId",
        "propertyName address addressLine1 cityOrTown landlord"
      )
      .lean();

    if (!tenant) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Tenant not found or not in agent's assigned properties",
        error: "Tenant not found",
      });
    }

    // Get tenant's lease information
    const lease = await Lease.findOne({
      tenantId: tenantId,
      propertyId: tenant.currentProperty?.propertyId,
    }).lean();

    // Format tenant data
    const formattedTenant = {
      id: tenant._id,
      firstName: tenant.firstName || tenant.user?.firstName,
      lastName: tenant.lastName || tenant.user?.lastName,
      email: tenant.email || tenant.user?.email,
      phoneNumber: tenant.phoneNumber || tenant.user?.phoneNumber,
      profileImage: tenant.profileImage || tenant.user?.profileImage,
      isActive:
        tenant.isActive !== undefined ? tenant.isActive : tenant.user?.isActive,
      dateOfBirth: tenant.dateOfBirth,
      gender: tenant.gender,
      city: tenant.city,
      country: tenant.country,
      maritalStatus: tenant.maritalStatus,
      employmentStatus: tenant.employmentStatus,
      preferredLanguage: tenant.preferredLanguage,
      religion: tenant.religion,
      currentProperty: tenant.currentProperty,
      propertyDetails: tenant.currentProperty?.propertyId,
      lease: lease,
      personalInformation: {
        emergencyContact: tenant.emergencyContact,
        socialLinks: tenant.socialLinks,
        notifications: tenant.notifications,
      },
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };

    res.status(200).json({
      status: true,
      data: formattedTenant,
      message: "Tenant retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error fetching agent tenant:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to fetch tenant",
      error: error.message,
    });
  }
};
