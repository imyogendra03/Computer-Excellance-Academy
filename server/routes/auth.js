const express  = require("express");
const router   = express.Router();
const crypto   = require("crypto");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const Examinee = require("../models/Examinee");
const redis    = require("../utils/redisClient");
const { sendVerificationEmail, sendOTPEmail } = require("../utils/emailService");
const { forgotPasswordLimiter, verifyOtpLimiter, loginLimiter } = require("../middlewares/rateLimiter");

const OTP_EXPIRY = () => parseInt(process.env.OTP_EXPIRY_MINUTES) * 60;
const otpKey      = (e) => `otp:${e}`;
const verifiedKey = (e) => `otp_verified:${e}`;

// ── Helper: tokens banana ─────────────────
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
  return { accessToken, refreshToken };
};

// ── REGISTER ─────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Sab fields required hain." });
    if (password.length < 6)
      return res.status(400).json({ message: "Password 6+ characters ka hona chahiye." });

    const exists = await Examinee.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email pehle se registered hai." });

    const hashed = await bcrypt.hash(password, 10);
    // const verifyToken = crypto.randomBytes(32).toString("hex");

    const examinee = await Examinee.create({
      name, email, password: hashed, // emailVerifyToken: verifyToken,
    });

    // await sendVerificationEmail(email, verifyToken);

    return res.status(201).json({
      message: "Registered successfully!",
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── EMAIL VERIFY ──────────────────────────
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token missing hai." });

    const examinee = await Examinee.findOne({ emailVerifyToken: token });
    if (!examinee)
      return res.status(400).json({ message: "Invalid ya expire token." });

    examinee.isVerified = true;
    examinee.emailVerifyToken = undefined;
    await examinee.save();

    return res.status(200).json({ message: "Email verify ho gayi! Ab login karo." });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── LOGIN ─────────────────────────────────
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email aur password chahiye." });

    const examinee = await Examinee.findOne({ email });
    if (!examinee)
      return res.status(401).json({ message: "Invalid credentials." });

    if (!examinee.isVerified)
      return res.status(403).json({ message: "Pehle email verify karo." });

    const isMatch = await bcrypt.compare(password, examinee.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const { accessToken, refreshToken } = generateTokens({
      id: examinee._id, email: examinee.email,
    });

    // Refresh token DB mein save karo
    examinee.refreshToken = refreshToken;
    await examinee.save();

    return res.status(200).json({
      message: "Login successful!",
      accessToken,
      refreshToken,
      user: { id: examinee._id, name: examinee.name, email: examinee.email },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── REFRESH TOKEN ─────────────────────────
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token chahiye." });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(403).json({ message: "Invalid ya expired refresh token." });
    }

    const examinee = await Examinee.findById(decoded.id);
    if (!examinee || examinee.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Token mismatch. Dobara login karo." });

    const tokens = generateTokens({ id: examinee._id, email: examinee.email });
    examinee.refreshToken = tokens.refreshToken;
    await examinee.save();

    return res.status(200).json(tokens);
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── LOGOUT ───────────────────────────────
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await Examinee.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: "" } }
      );
    }
    return res.status(200).json({ message: "Logout successful!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── FORGOT PASSWORD (OTP) ─────────────────
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required." });

    const examinee = await Examinee.findOne({ email });
    if (!examinee)
      return res.status(200).json({ message: "Agar email registered hai toh OTP bheja gaya hai." });

    const otp = crypto.randomInt(100000, 999999).toString();
    await redis.set(otpKey(email), otp, "EX", OTP_EXPIRY());
    await redis.del(verifiedKey(email));
    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP bhej diya gaya hai." });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── VERIFY OTP ───────────────────────────
router.post("/verify-otp", verifyOtpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = await redis.get(otpKey(email));
    if (!stored) return res.status(400).json({ message: "OTP expire ho gaya." });
    if (stored !== otp) return res.status(400).json({ message: "Galat OTP." });

    await redis.set(verifiedKey(email), "true", "EX", OTP_EXPIRY());
    return res.status(200).json({ message: "OTP verified!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── RESET PASSWORD ───────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const [stored, isVerified] = await Promise.all([
      redis.get(otpKey(email)), redis.get(verifiedKey(email)),
    ]);
    if (!stored || !isVerified) return res.status(400).json({ message: "OTP verify nahi hua." });
    if (stored !== otp) return res.status(400).json({ message: "Galat OTP." });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Password 6+ characters ka hona chahiye." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await Examinee.findOneAndUpdate({ email }, { password: hashed });
    await Promise.all([redis.del(otpKey(email)), redis.del(verifiedKey(email))]);

    return res.status(200).json({ message: "Password reset ho gaya!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;