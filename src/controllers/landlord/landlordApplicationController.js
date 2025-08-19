import Landlord from "../../models/Landlord.js";
import TenantApplication from "../../models/TenantApplication.js";
import Property from "../../models/Property.js";
import RentalHistory from "../../models/RentalHistory.js";
import Tenant from "../../models/Tenant.js";
import User from "../../models/User.js";
import { createNotification } from "../../services/notificationService.js";
import { sendEmail } from "../../services/emailService.js";
import {
  createApplicationApprovedEmail,
  createApplicationCancelledEmail,
} from "../../templates/applicationNotification.js";

/**
 * Get all rental applications for the landlord
 */
export const getAllApplications = async (req, res) => {
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

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { landlord: landlord._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const applications = await TenantApplication.find(query)
      .populate(
        "property",
        "propertyName address monthlyRent propertyType bedrooms bathrooms frontImage"
      )
      .populate("tenant", "firstName lastName email phoneNumber")
      .populate("landlord", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Fetch rental history for each application's tenant
    const applicationsWithRentalHistory = await Promise.all(
      applications.map(async (application) => {
        const rentalHistory = await RentalHistory.find({
          tenant: application.tenant,
        }).sort({ "rentalDates.startDate": -1 });

        return {
          ...application.toObject(),
          rentalHistory,
        };
      })
    );

    const total = await TenantApplication.countDocuments(query);

    // Get summary statistics
    const summary = await TenantApplication.aggregate([
      { $match: { landlord: landlord._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summaryStats = {
      total: 0,
      pending: 0,
      approved: 0,
      cancelled: 0,
    };

    summary.forEach((stat) => {
      summaryStats[stat._id] = stat.count;
      summaryStats.total += stat.count;
    });

    res.json({
      status: true,
      data: {
        applications: applicationsWithRentalHistory,
        summary: summaryStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: "Applications retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve applications",
      error: error.message,
    });
  }
};

/**
 * Get a specific application by ID
 */
export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    const application = await TenantApplication.findOne({
      _id: applicationId,
      landlord: landlord._id,
    })
      .populate(
        "property",
        "propertyName address monthlyRent propertyType bedrooms bathrooms frontImage description"
      )
      .populate(
        "tenant",
        "firstName lastName email phoneNumber address country city"
      )
      .populate("landlord", "firstName lastName email phoneNumber");

    if (!application) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Application not found",
        error: null,
      });
    }

    // Fetch rental history for this tenant
    const rentalHistory = await RentalHistory.find({
      tenant: application.tenant,
    }).sort({ "rentalDates.startDate": -1 });

    // Attach rental history to application
    const applicationWithRentalHistory = {
      ...application.toObject(),
      rentalHistory,
    };

    res.json({
      status: true,
      data: applicationWithRentalHistory,
      message: "Application retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve application",
      error: error.message,
    });
  }
};

/**
 * Approve or cancel an application
 */
export const respondToApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { decision } = req.body;
    const landlord = await Landlord.findOne({ user: req.user.userId });

    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord not found",
        error: null,
      });
    }

    if (!["approved", "cancelled"].includes(decision)) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Decision must be either 'approved' or 'cancelled'",
        error: null,
      });
    }

    const application = await TenantApplication.findOne({
      _id: applicationId,
      landlord: landlord._id,
    }).populate("property", "propertyName address");

    if (!application) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Application not found",
        error: null,
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Application has already been processed",
        error: null,
      });
    }

    // Update application status
    application.status = decision;
    await application.save();

    // Create notification for tenant
    await createNotification({
      recipientId: application.tenant,
      userRole: "tenant",
      type: "application_response",
      message: `Your application for ${application.property.propertyName} has been ${decision}`,
    });

    // Send email notification to tenant
    const tenant = await Tenant.findOne({ user: application.tenant });
    const user = await User.findById(application.tenant);

    if (tenant && user) {
      const emailTemplate =
        decision === "approved"
          ? createApplicationApprovedEmail({
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              propertyName: application.property.propertyName,
              propertyAddress: application.property.address,
            })
          : createApplicationCancelledEmail({
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              propertyName: application.property.propertyName,
              propertyAddress: application.property.address,
            });

      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    res.json({
      status: true,
      data: application,
      message: `Application ${decision} successfully`,
      error: null,
    });
  } catch (error) {
    console.error("Respond to application error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to respond to application",
      error: error.message,
    });
  }
};

/**
 * Get applications for a specific property
 */
export const getPropertyApplications = async (req, res) => {
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

    // Verify the property belongs to the landlord
    const property = await Property.findOne({
      _id: propertyId,
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

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      property: propertyId,
      landlord: landlord._id,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const applications = await TenantApplication.find(query)
      .populate("tenant", "firstName lastName email phoneNumber")
      .populate("property", "propertyName address monthlyRent")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Fetch rental history for each application's tenant
    const applicationsWithRentalHistory = await Promise.all(
      applications.map(async (application) => {
        const rentalHistory = await RentalHistory.find({
          tenant: application.tenant,
        }).sort({ "rentalDates.startDate": -1 });

        return {
          ...application.toObject(),
          rentalHistory,
        };
      })
    );

    const total = await TenantApplication.countDocuments(query);

    res.json({
      status: true,
      data: {
        applications: applicationsWithRentalHistory,
        property: {
          id: property._id,
          name: property.propertyName,
          address: property.address,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: "Property applications retrieved successfully",
      error: null,
    });
  } catch (error) {
    console.error("Get property applications error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to retrieve property applications",
      error: error.message,
    });
  }
};
