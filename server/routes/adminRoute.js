const Admin = require("../models/Admin");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: generate token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  });
};
// Register admin
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Registering:", email);

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // DISABLE BCRYPT FOR TEST
    const admin = await Admin.create({ email, password: password });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully (PLAIN TEXT)",
      admin: { id: admin._id, email: admin.email }
    });
  } catch (error) {
    console.error("Admin register error:", error.message);
    return res.status(500).json({ message: "Register server error: " + error.message });
  }
});

// Admin login route
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

    // Check plain text or bcrypt
    const isMatch = (password === admin.password) || (await bcrypt.compare(password, admin.password));
    if (!isMatch) {
      return res.status(400).json({ message: "Username or password Incorrect" });
    }

    const token = generateToken({ id: admin._id, email: admin.email, role: "admin" });

    return res.json({
      message: "Login Successfully",
      token,
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

// Change password
router.put("/change/:email", async (req, res) => {
  try {
    const { op, np, cnp } = req.body;
    const admin = await Admin.findOne({ email: req.params.email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(op, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old Password is Incorrect" });
    }

    if (np !== cnp) {
      return res.status(400).json({
        message: "New Password and Confirm Password do not match",
      });
    }

    const hashed = await bcrypt.hash(np, 10);
    await Admin.findOneAndUpdate(
      { email: req.params.email },
      { password: hashed },
      { new: true }
    );

    return res.json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      message: "Server error while changing password",
    });
  }
});

module.exports = router;