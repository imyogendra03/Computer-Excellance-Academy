const Admin = require("../models/Admin");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Register admin
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashed });
    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Admin register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Username or password Incorrect" });
    }

    if ("lastLoginAt" in admin) {
      admin.lastLoginAt = new Date();
      await admin.save();
    }

    return res.json({
      message: "Login Successfully",
      admin: {
        role: "admin",
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error during login" });
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