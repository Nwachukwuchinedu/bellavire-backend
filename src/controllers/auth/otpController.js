import { AuthService } from "../../services/auth/authService.js";

export const verifyOTPController = async (req, res) => {
    const { userId, otp } = req.body;
    try {
        await AuthService.verifyUserOTP(userId, otp);
        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const resendOTPController = async (req, res) => {
    const { userId } = req.body;
    try {
        await AuthService.resendUserOTP(userId);
        return res.status(200).json({ success: true, message: "OTP resent successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}; 