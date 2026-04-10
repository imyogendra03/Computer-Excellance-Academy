const crypto = require("crypto");
const nodemailer = require("nodemailer");
const redisClient = require("./redisClient");
const bcrypt = require("bcryptjs");

const transporter =
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : nodemailer.createTransport({ jsonTransport: true });

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_TIME = 900; // 15 minutes

/**
 * Generate 6-digit numeric OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Email
 */
const sendEmailOTP = async (email, otp) => {
  const fromEmail = process.env.EMAIL_USER || "no-reply@cea.local";

  const mailOptions = {
    from: `"Computer Excellence Academy" <${fromEmail}>`,
    to: email,
    subject: "Your Verification Code - Computer Excellence Academy",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #6c3de8; text-align: center;">Verification Code</h2>
        <p>Hello,</p>
        <p>Use the following 6-digit OTP to complete your registration/login at Computer Excellence Academy. This code is valid for 3 minutes.</p>
        <div style="background-color: #f8f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="letter-spacing: 8px; color: #1a1a2e; margin: 0;">${otp}</h1>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">Computer Excellence Academy - Digital Learning Platform</p>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Email OTP send failed:", err.message);
    throw new Error(
      "OTP email could not be sent. Please configure EMAIL_USER and EMAIL_PASS in server/.env."
    );
  }
};

/**
 * Send OTP via Mobile (Mock implementation as requested)
 */
const sendMobileOTP = async (number, otp) => {
  return true; 
};

/**
 * SECURITY FIX: Hash OTP before storing + add attempt counter
 */
const storeOTP = async (key, otp) => {
  try {
    const hashedOtp = await bcrypt.hash(otp, 10);
    await redisClient.set(`otp:${key}`, hashedOtp, "EX", 180); // 3 minutes
    await redisClient.set(`otp_cooldown:${key}`, "1", "EX", 30);
    await redisClient.set(`otp_fail:${key}`, "0", "EX", OTP_LOCKOUT_TIME);
  } catch (err) {
    console.error("OTP storage failed:", err);
    throw err;
  }
};

/**
 * Check if OTP is in cooldown
 */
const checkCooldown = async (key) => {
  const cooldown = await redisClient.get(`otp_cooldown:${key}`);
  return !!cooldown;
};

/**
 * SECURITY FIX: Check if account is locked after max attempts
 */
const checkOtpLockout = async (key) => {
  const attempts = await redisClient.get(`otp_fail:${key}`);
  return Number(attempts || 0) >= MAX_OTP_ATTEMPTS;
};

/**
 * SECURITY FIX: Increment failed attempt counter
 */
const incrementOtpFailure = async (key) => {
  const attempts = await redisClient.incr(`otp_fail:${key}`);
  if (attempts === 1) {
    await redisClient.expire(`otp_fail:${key}`, OTP_LOCKOUT_TIME);
  }
  return attempts;
};

/**
 * SECURITY FIX: Verify OTP with hashing + max attempts
 */
const verifyOTPFromStore = async (key, otp) => {
  // Check lockout
  if (await checkOtpLockout(key)) {
    return { valid: false, message: "❌ Too many attempts. Try after 15 minutes." };
  }

  const hashedOtp = await redisClient.get(`otp:${key}`);
  if (!hashedOtp) return { valid: false, message: "❌ OTP expired or not found" };
  
  try {
    const isValid = await bcrypt.compare(otp, hashedOtp);
    if (!isValid) {
      const failCount = await incrementOtpFailure(key);
      const remaining = MAX_OTP_ATTEMPTS - failCount;
      return { 
        valid: false, 
        message: remaining > 0 
          ? `❌ Invalid OTP. ${remaining} attempts remaining.`
          : "❌ Too many failed attempts. Try after 15 minutes."
      };
    }

    // Success
    await redisClient.del(`otp:${key}`);
    await redisClient.del(`otp_fail:${key}`);
    await redisClient.del(`otp_cooldown:${key}`);
    return { valid: true };
  } catch (err) {
    console.error("OTP verification error:", err);
    return { valid: false, message: "❌ OTP verification failed" };
  }
};

module.exports = {
  generateOTP,
  sendEmailOTP,
  sendMobileOTP,
  storeOTP,
  checkCooldown,
  checkOtpLockout,
  incrementOtpFailure,
  verifyOTPFromStore,
};
