const rateLimit = require("express-rate-limit");

const make = (max, windowMin, msg) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: msg },
  });

const loginLimiter         = make(10, 15, "Bahut zyada login attempts. 15 min baad try karo.");
const forgotPasswordLimiter = make(5, 15, "Bahut zyada OTP requests. 15 min baad try karo.");
const verifyOtpLimiter     = make(10, 15, "Bahut zyada galat OTP. 15 min baad try karo.");

module.exports = { loginLimiter, forgotPasswordLimiter, verifyOtpLimiter };