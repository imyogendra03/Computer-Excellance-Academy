const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Examinee = require("../models/Examinee");
const redis = require("../utils/redisClient");
const otpService = require("../utils/otpService");
const tokenUtils = require("../utils/tokenUtils");
const { loginLimiter, forgotPasswordLimiter } = require("../middlewares/rateLimiter");

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

const generateTokens = (payload) => {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    sid: payload.sid || "",
    role: payload.role || "user",
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
  return { accessToken, refreshToken };
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, number, password, address, college, qualification, session } = req.body;

    if (!name || !email || !number || !password) {
      return res.status(400).json({ success: false, message: "Required fields missing." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    const existing = await Examinee.findOne({ $or: [{ email }, { number }] });
    if (existing) {
      const field = existing.email === email ? "Email" : "Mobile number";
      return res.status(409).json({ success: false, message: `${field} is already registered.` });
    }

    const otp = otpService.generateOTP();
    await otpService.storeOTP(email, otp);
    await otpService.storeOTP(number, otp);

    const tempData = { ...req.body, otp };
    await redis.set(`temp_user:${email}`, JSON.stringify(tempData), "EX", 900);

    await otpService.sendEmailOTP(email, otp);
    await otpService.sendMobileOTP(number, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email and mobile number.",
    });
  } catch (err) {
    console.error("Register Init Error:", err);
    return res.status(500).json({ success: false, message: "Could not initiate registration." });
  }
});

router.post("/verify-registration", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const otpCheck = await otpService.verifyOTPFromStore(email, otp);
    if (!otpCheck.valid) {
      return res.status(400).json({ success: false, message: otpCheck.message });
    }

    const rawData = await redis.get(`temp_user:${email}`);
    if (!rawData) {
      return res.status(400).json({ success: false, message: "Registration session expired. Please register again." });
    }

    const userData = JSON.parse(rawData);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newExaminee = await Examinee.create({
      ...userData,
      password: hashedPassword,
      isVerified: true,
      otpVerified: true,
    });

    await redis.del(`temp_user:${email}`);

    return res.status(201).json({
      success: true,
      message: "Account verified and created successfully!",
      user: { id: newExaminee._id, name: newExaminee.name, email: newExaminee.email },
    });
  } catch (err) {
    console.error("Verify Registration Error:", err);
    return res.status(500).json({ success: false, message: "Verification failed." });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required." });
    }

    const examinee = await Examinee.findOne({ email });
    if (!examinee) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, examinee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const otp = otpService.generateOTP();
    await otpService.storeOTP(email, otp);
    await otpService.sendEmailOTP(email, otp);
    return res.status(202).json({
      success: true,
      message: "OTP sent to your registered email.",
    });
  } catch (err) {
    console.error("Login Step 1 Error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/verify-login", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required." });
    }

    const otpCheck = await otpService.verifyOTPFromStore(email, otp);
    if (!otpCheck.valid) {
      return res.status(401).json({ success: false, message: otpCheck.message });
    }

    const examinee = await Examinee.findOne({ email });
    if (!examinee) return res.status(404).json({ success: false, message: "User not found." });

    const previousSessionId = examinee.currentSessionId;
    const newSessionId = crypto.randomBytes(16).toString("hex");
    
    const { accessToken, refreshToken } = generateTokens({ 
      id: examinee._id, 
      email: examinee.email, 
      sid: newSessionId,
      role: "user"
    });

    // SECURITY FIX: Hash refresh token before storage
    examinee.refreshToken = tokenUtils.hashRefreshToken(refreshToken);
    examinee.currentSessionId = newSessionId;
    examinee.lastLoginAt = new Date();
    await examinee.save();

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      accessToken,
      refreshToken,
      user: { id: examinee._id, name: examinee.name, email: examinee.email, role: "user" },
    });
  } catch (err) {
    console.error("Verify Login Error:", err);
    return res.status(500).json({ success: false, message: "Verification failed." });
  }
});

router.post("/forgot-init", forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const examinee = await Examinee.findOne({ email });
    if (!examinee) {
      return res.status(200).json({ success: true, message: "If registered, an OTP has been sent to your email." });
    }

    const otp = otpService.generateOTP();
    await otpService.storeOTP(email, otp);

    try {
      await otpService.sendEmailOTP(email, otp);
      return res.status(200).json({ success: true, message: "OTP sent to your registered email." });
    } catch (mailErr) {
      console.error("[auth] sendEmailOTP error:", mailErr.message);
      if (process.env.NODE_ENV !== "production") {
        return res.status(200).json({ success: true, message: "OTP stored (dev).", debugOtp: otp });
      }
      return res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
  } catch (err) {
    console.error("Forgot-init error:", err);
    return res.status(500).json({ success: false, message: "Could not start reset flow." });
  }
});

router.get("/ping", (req, res) => {
  return res.json({ success: true, message: "auth route alive" });
});

router.get("/debug-otp", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ success: false, message: "key query required" });
    const otp = await redis.get(`otp:${key}`);
    return res.json({ success: true, key, otp });
  } catch (err) {
    console.error("Debug OTP error:", err);
    return res.status(500).json({ success: false, message: "Debug error" });
  }
});

router.post("/forgot-complete", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required." });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      });
    }

    const otpCheck = await otpService.verifyOTPFromStore(email, otp);
    if (!otpCheck.valid) {
      return res.status(400).json({ success: false, message: otpCheck.message || "Invalid OTP." });
    }

    const examinee = await Examinee.findOne({ email });
    if (!examinee) return res.status(404).json({ success: false, message: "User not found." });

    examinee.password = await bcrypt.hash(newPassword, 10);
    examinee.refreshToken = null;
    examinee.currentSessionId = null;
    await examinee.save();

    return res.status(200).json({ success: true, message: "Password reset successful. Please log in." });
  } catch (err) {
    console.error("Forgot-complete error:", err);
    return res.status(500).json({ success: false, message: "Could not reset password." });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required." });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const examinee = await Examinee.findById(decoded.id);

    // SECURITY FIX: Verify hash instead of comparing plaintext tokens
    if (!examinee || !tokenUtils.verifyRefreshToken(refreshToken, examinee.refreshToken)) {
      return res.status(403).json({ success: false, message: "Invalid session. Please login again." });
    }

    const tokens = generateTokens({ 
      id: examinee._id, 
      email: examinee.email,
      sid: decoded.sid,
      role: decoded.role || "user"
    });
    // Hash new refresh token before storage
    examinee.refreshToken = tokenUtils.hashRefreshToken(tokens.refreshToken);
    await examinee.save();

    return res.status(200).json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err) {
    return res.status(403).json({ success: false, message: "Token expired or invalid." });
  }
});

router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required." });

    const examinee = await Examinee.findOne({ email });
    if (!examinee) {
      return res.status(200).json({ success: true, message: "If registered, an OTP has been sent." });
    }

    const otp = otpService.generateOTP();
    await otpService.storeOTP(email, otp);
    await otpService.sendEmailOTP(email, otp);

    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const otpCheck = await otpService.verifyOTPFromStore(email, otp);
    if (!otpCheck.valid) {
      return res.status(400).json({ success: false, message: otpCheck.message });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Examinee.findOneAndUpdate({ email }, { password: hashedPassword });

    return res.status(200).json({ success: true, message: "Password reset successful!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await Examinee.findOneAndUpdate({ refreshToken }, { $unset: { refreshToken: "" } });
    }
    return res.status(200).json({ success: true, message: "Logout successful!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
