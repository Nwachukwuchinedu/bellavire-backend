import Landlord from "../../models/Landlord.js";
import { uploads } from "../../utils/fileUtils.js";

/**
 * Upload lease document for landlord
 */
export const uploadLeaseDocument = async (req, res) => {
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: false,
        data: null,
        message: "No lease document uploaded",
        error: null,
      });
    }

    // Use the existing uploads function with 'landlord' folder
    const fileInfo = await uploads(
      req.file.buffer,
      req.file.originalname,
      "landlord"
    );

    // Save the lease template path to landlord record
    landlord.leaseTemplate = fileInfo.path;
    await landlord.save();

    res.json({
      status: true,
      data: {
        documentPath: fileInfo.path,
        documentUrl: `${process.env.BACKEND_BASE_URL}${fileInfo.path}`,
        fileType: fileInfo.type,
        message: "Lease document uploaded successfully",
      },
      message: "Lease document uploaded successfully",
      error: null,
    });
  } catch (error) {
    console.error("Upload lease document error:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: "Failed to upload lease document",
      error: error.message,
    });
  }
};
