const Admin = require("../models/Admin");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const tokenUtils = require("../utils/tokenUtils");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Content = require("../models/Content");

const generateTokens = (payload) => {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    sid: payload.sid || "",
    role: payload.role || "admin",
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  });
  return { accessToken, refreshToken };
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
};

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

const compareAndUpgradePassword = async (admin, plainPassword) => {
  if (!admin?.password) {
    return false;
  }

  const isBcryptHash = String(admin.password).startsWith("$2");
  const isMatch = isBcryptHash
    ? await bcrypt.compare(plainPassword, admin.password)
    : admin.password === plainPassword;

  if (isMatch && !isBcryptHash) {
    admin.password = await bcrypt.hash(plainPassword, 10);
    await admin.save();
  }

  return isMatch;
};
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, and a number.",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: { id: admin._id, email: admin.email }
    });
  } catch (error) {
    console.error("Admin register error:", error.message);
    return res.status(500).json({ message: "Register server error: " + error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
        return res.status(500).json({ 
            message: "Database not connected", 
            state: mongoose.connection.readyState 
        });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await compareAndUpgradePassword(admin, password);
    if (!isMatch) {
      return res.status(400).json({ message: "Username or password Incorrect" });
    }

    const sid = crypto.randomBytes(16).toString("hex");
    const { accessToken, refreshToken } = generateTokens({ 
      id: admin._id, 
      email: admin.email, 
      role: "admin", 
      sid 
    });

    admin.currentSessionId = sid;
    // SECURITY FIX: Hash refresh token before storage
    admin.refreshToken = tokenUtils.hashRefreshToken(refreshToken);
    admin.lastLoginAt = new Date();
    
    try {
      await admin.save();
    } catch (saveError) {
      console.error("Error saving admin session:", saveError);
      return res.status(500).json({ message: "Failed to establish session. Please try again." });
    }

    return res.json({
      message: "Login Successfully",
      token: accessToken,
      accessToken,
      refreshToken,
      admin: {
        role: "admin",
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({ message: "Login server error: " + error.message });
  }
});

router.get("/me", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name || "Administrator",
        role: req.user.role || "admin",
        lastLoginAt: req.user.lastLoginAt || null,
        createdAt: req.user.createdAt || null,
      },
    });
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch admin profile",
      error: error.message 
    });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      console.error("Refresh token verification failed:", err.message);
      return res.status(403).json({ success: false, message: "Refresh token expired or invalid." });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(403).json({ success: false, message: "Admin not found." });
    }

    // Verify hashed refresh token
    if (!tokenUtils.verifyRefreshToken(refreshToken, admin.refreshToken)) {
      console.warn("Refresh token hash mismatch for admin:", decoded.id);
      return res.status(403).json({ success: false, message: "Invalid refresh token." });
    }

    const tokens = generateTokens({
      id: admin._id,
      email: admin.email,
      role: "admin",
      sid: decoded.sid,
    });

    // Hash new refresh token before storage
    admin.refreshToken = tokenUtils.hashRefreshToken(tokens.refreshToken);
    try {
      await admin.save();
    } catch (saveErr) {
      console.error("Failed to save new refresh token:", saveErr);
      // Still return the tokens even if save fails, so user doesn't get stuck
    }

    return res.status(200).json({ 
      success: true, 
      accessToken: tokens.accessToken, 
      refreshToken: tokens.refreshToken 
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    return res.status(403).json({ success: false, message: "Token refresh failed." });
  }
});

// Compatibility subject routes under /api/admin/*
router.post("/subject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      subjectname: req.body?.subjectname || req.body?.title || "",
      title: req.body?.title || req.body?.subjectname || "",
      createdBy: req.user?._id || null,
    };

    if (!payload.subjectname?.trim()) {
      return res.status(400).json({ success: false, message: "Subject name is required." });
    }

    const subject = await Subject.create(payload);
    return res.status(201).json({ success: true, data: subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/subject/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.subjectname && !payload.title) payload.title = payload.subjectname;
    if (payload.title && !payload.subjectname) payload.subjectname = payload.title;

    const subject = await Subject.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found." });
    }
    return res.json({ success: true, data: subject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/subject/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ success: false, message: "Subject not found." });
    }

    const chapters = await Chapter.find({ subjectId: req.params.id }).select("_id");
    const chapterIds = chapters.map((chapter) => chapter._id);
    await Content.deleteMany({ subjectId: req.params.id });
    await Content.deleteMany({ chapterId: { $in: chapterIds } });
    await Chapter.deleteMany({ subjectId: req.params.id });

    return res.json({ success: true, message: "Subject deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Compatibility chapter routes under /api/admin/*
router.post("/chapter", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, batchId, subjectId, order, status } = req.body || {};

    if (!title || !batchId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: "title, batchId and subjectId are required.",
      });
    }

    if (!mongoose.isValidObjectId(batchId) || !mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId or subjectId.",
      });
    }

    const chapter = await Chapter.create({
      title: title.trim(),
      batchId,
      subjectId,
      order: Number(order) || 0,
      status: status || "active",
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Chapter created successfully.",
      data: chapter,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/chapter/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found." });
    }
    return res.json({ success: true, data: chapter });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/chapter/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found." });
    }
    await Content.deleteMany({ chapterId: req.params.id });
    return res.json({ success: true, message: "Chapter deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const changePasswordHandler = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const admin = await Admin.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    const isMatch = await compareAndUpgradePassword(admin, oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old Password is Incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New Password and Confirm Password do not match",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include uppercase, lowercase, and a number.",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      message: "Server error while changing password",
    });
  }
};

router.put("/change-password", authMiddleware, adminMiddleware, changePasswordHandler);

router.put("/change/:email", authMiddleware, adminMiddleware, async (req, res) => {
  req.body.oldPassword = req.body.oldPassword || req.body.op;
  req.body.newPassword = req.body.newPassword || req.body.np;
  req.body.confirmPassword = req.body.confirmPassword || req.body.cnp;
  return changePasswordHandler(req, res);
});

module.exports = router;
