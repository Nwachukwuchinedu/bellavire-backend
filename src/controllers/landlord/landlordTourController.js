import Landlord from "../../models/Landlord.js";
import Tour from "../../models/Tour.js";
import { sendEmail } from "../../services/emailService.js";
import { createTourNotificationEmail } from "../../templates/tourNotification.js";

// Get landlord's tours
export const getMyTours = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, dateFrom, dateTo } = req.query;

    // Find landlord record using user ID
    const landlord = await Landlord.findOne({ user: userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord profile not found",
        error: "Landlord not found",
      });
    }

    const query = { landlord: landlord._id };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (dateFrom) {
      query.date = { $gte: new Date(dateFrom) };
    }
    if (dateTo) {
      query.date = { ...query.date, $lte: new Date(dateTo) };
    }

    const tours = await Tour.find(query)
      .populate("property", "propertyName address frontImage")
      .populate("tenant", "firstName lastName email phoneNumber")
      .populate("landlord", "firstName lastName email phoneNumber")
      .sort({ date: 1, timeSlot: 1 });

    return res.status(200).json({
      status: true,
      data: tours,
      message: "Tours retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get tour by ID
export const getTourById = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user.userId;

    // Find landlord record using user ID
    const landlord = await Landlord.findOne({ user: userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord profile not found",
        error: "Landlord not found",
      });
    }

    const tour = await Tour.findById(tourId)
      .populate("property", "propertyName address frontImage monthlyRent")
      .populate("tenant", "firstName lastName email phoneNumber")
      .populate("landlord", "firstName lastName email phoneNumber");

    if (!tour) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Tour not found",
        error: "Tour not found",
      });
    }

    // Check if landlord has permission to view this tour
    if (tour.landlord.toString() !== landlord._id.toString()) {
      return res.status(403).json({
        status: false,
        data: null,
        message: "Unauthorized access - You can only access your own tours",
        error: "Unauthorized",
      });
    }

    return res.status(200).json({
      status: true,
      data: tour,
      message: "Tour retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update tour status (confirm, decline, complete)
export const updateTourStatus = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.userId;

    // Find landlord record using user ID
    const landlord = await Landlord.findOne({ user: userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord profile not found",
        error: "Landlord not found",
      });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "declined",
      "cancelled",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Invalid status",
        error:
          "Status must be one of: pending, confirmed, declined, cancelled, completed",
      });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Tour not found",
        error: "Tour not found",
      });
    }

    // Check if landlord has permission to update this tour
    if (tour.landlord.toString() !== landlord._id.toString()) {
      return res.status(403).json({
        status: false,
        data: null,
        message: "Unauthorized access - You can only update your own tours",
        error: "Unauthorized",
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ["confirmed", "declined", "cancelled"],
      confirmed: ["cancelled", "completed"],
      declined: [],
      cancelled: [],
      completed: [],
    };

    if (!validTransitions[tour.status].includes(status)) {
      return res.status(400).json({
        status: false,
        data: null,
        message: `Cannot change status from ${tour.status} to ${status}`,
        error: "Invalid status transition",
      });
    }

    // Update tour
    tour.status = status;
    if (notes) {
      tour.landlordNotes = notes;
    }

    await tour.save();

    // Send notification
    await sendTourNotification(tour, status);

    return res.status(200).json({
      status: true,
      data: tour,
      message: `Tour ${status} successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reschedule tour
export const rescheduleTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { date, timeSlot } = req.body;
    const userId = req.user.userId;

    // Find landlord record using user ID
    const landlord = await Landlord.findOne({ user: userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord profile not found",
        error: "Landlord not found",
      });
    }

    // Validate required fields
    if (!date || !timeSlot) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Date and time slot are required",
        error: "Missing required fields",
      });
    }

    // Validate date is in the future
    const tourDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tourDate < today) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "Tour date must be in the future",
        error: "Invalid date",
      });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Tour not found",
        error: "Tour not found",
      });
    }

    // Check if landlord has permission to reschedule this tour
    if (tour.landlord.toString() !== landlord._id.toString()) {
      return res.status(403).json({
        status: false,
        data: null,
        message: "Unauthorized access - You can only reschedule your own tours",
        error: "Unauthorized",
      });
    }

    // Calculate start and end times for the rescheduled tour
    const tourDuration = tour.duration || 30;
    const [startHour, startMinute] = timeSlot.split(":").map(Number);
    const startTime = new Date(tourDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + tourDuration);

    // Check for time conflicts with existing tours (excluding the current tour being rescheduled)
    const existingTours = await Tour.find({
      property: tour.property,
      date: tourDate,
      status: { $in: ["pending", "confirmed"] },
      _id: { $ne: tourId },
    });

    // Check for time conflicts
    for (const existingTour of existingTours) {
      const [existingStartHour, existingStartMinute] = existingTour.timeSlot
        .split(":")
        .map(Number);
      const existingStartTime = new Date(tourDate);
      existingStartTime.setHours(existingStartHour, existingStartMinute, 0, 0);

      const existingEndTime = new Date(existingStartTime);
      existingEndTime.setMinutes(
        existingEndTime.getMinutes() + (existingTour.duration || 30)
      );

      // Check if there's a time overlap
      // Conflict occurs when:
      // - Requested start time is before existing end time AND
      // - Requested end time is after existing start time
      if (startTime < existingEndTime && endTime > existingStartTime) {
        return res.status(409).json({
          status: false,
          data: null,
          message: `Time conflict detected. The rescheduled tour time (${timeSlot} for ${tourDuration} minutes) overlaps with an existing tour. Please choose a different time.`,
          error: "Time conflict",
          conflictDetails: {
            requestedTime: {
              start: startTime.toLocaleTimeString(),
              end: endTime.toLocaleTimeString(),
              duration: tourDuration,
            },
            conflictingTour: {
              start: existingStartTime.toLocaleTimeString(),
              end: existingEndTime.toLocaleTimeString(),
              duration: existingTour.duration || 30,
            },
          },
        });
      }
    }

    // Store original date if not already stored
    if (!tour.originalDate) {
      tour.originalDate = tour.date;
    }

    // Update tour
    tour.date = tourDate;
    tour.timeSlot = timeSlot;
    tour.rescheduled = true;
    tour.status = "pending"; // Reset to pending for approval

    await tour.save();

    // Send notification
    await sendTourNotification(tour, "rescheduled");

    return res.status(200).json({
      status: true,
      data: tour,
      message: "Tour rescheduled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get landlord calendar
export const getTourCalendar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    // Find landlord record using user ID
    const landlord = await Landlord.findOne({ user: userId });
    if (!landlord) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Landlord profile not found",
        error: "Landlord not found",
      });
    }

    // Set default date range if not provided
    let queryStartDate, queryEndDate;

    if (startDate && endDate) {
      // Use provided dates
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
    } else {
      // Default to current month
      const now = new Date();
      queryStartDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
      queryEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    }

    const tours = await Tour.find({
      landlord: landlord._id,
      date: { $gte: queryStartDate, $lte: queryEndDate },
    })
      .populate("property", "propertyName address")
      .populate("tenant", "firstName lastName email phoneNumber")
      .populate("landlord", "firstName lastName email phoneNumber")
      .sort({ date: 1, timeSlot: 1 });

    // Group tours by date
    const calendarData = {};
    tours.forEach((tour) => {
      const dateKey = tour.date.toISOString().split("T")[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push(tour);
    });

    return res.status(200).json({
      status: true,
      data: {
        calendarData: calendarData,
        dateRange: {
          startDate: queryStartDate.toISOString().split("T")[0],
          endDate: queryEndDate.toISOString().split("T")[0],
          isDefault: !startDate || !endDate,
        },
      },
      message: "Calendar data retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      data: null,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to send tour notifications
const sendTourNotification = async (tour, action) => {
  try {
    const populatedTour = await Tour.findById(tour._id)
      .populate("property", "propertyName address")
      .populate("tenant", "firstName lastName email")
      .populate("landlord", "firstName lastName email");

    const tourData = {
      propertyName: populatedTour.property.propertyName,
      date: populatedTour.date,
      timeSlot: populatedTour.timeSlot,
      tenantName: `${populatedTour.tenant.firstName} ${populatedTour.tenant.lastName}`,
      landlordName: `${populatedTour.landlord.firstName} ${populatedTour.landlord.lastName}`,
      notes: populatedTour.notes,
    };

    const emailTemplate = createTourNotificationEmail(action, tourData);
    if (!emailTemplate) return;

    // Send email to tenant
    if (
      ["confirmed", "declined", "cancelled", "rescheduled"].includes(action)
    ) {
      await sendEmail({
        to: populatedTour.tenant.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }

    // Send email to landlord for new requests
    if (action === "request") {
      await sendEmail({
        to: populatedTour.landlord.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    }
  } catch (error) {
    console.error("Error sending tour notification:", error);
  }
};
