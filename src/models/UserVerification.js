import mongoose from "mongoose";

const userVerificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
});

const UserVerification = mongoose.model("UserVerification", userVerificationSchema);
export default UserVerification; 