const Examinee = require("../models/Examinee");
const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendMail");
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Update profile with file upload
router.put("/:id", upload.single("profileImage"), async (req, res) => {
  try {
    const {
      name,
      email,
      number,
      address,
      password,
      college,
      qualification,
      status,
      session,
    } = req.body;

    const updateData = {
      name,
      email,
      number,
      address,
      password,
      college,
      qualification,
      status,
      session,
    };

    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const updatedExaminee = await Examinee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedExaminee) {
      return res
        .status(404)
        .json({ success: false, message: "Examinee not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedExaminee,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get purchased batches for logged-in user
router.get("/:id/my-batches", async (req, res) => {
  try {
    const { id } = req.params;

    const examinee = await Examinee.findById(id)
      .populate("purchasedBatches.batch")
      .populate("purchasedBatches.course")
      .populate("purchasedBatches.paymentId");

    if (!examinee) {
      return res.status(404).json({ message: "Examinee not found" });
    }

    return res.json({
      success: true,
      data: examinee.purchasedBatches || [],
    });
  } catch (error) {
    console.error("My batches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get examinee by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const examinee = await Examinee.findById(id);

    if (!examinee) {
      return res.status(404).json({ message: "Examinee not found" });
    }

    return res.json({ data: examinee });
  } catch (error) {
    console.error("Fetch examinee error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all examinees
router.get("/", async (req, res) => {
  try {
    const examinee = await Examinee.find();
    return res.json({ data: examinee });
  } catch (error) {
    console.error("Fetch all examinees error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Register examinee
router.post("/register", async (req, res) => {
  try {
    const { email, name } = req.body;

    const existingExaminee = await Examinee.findOne({ email });
    if (existingExaminee) {
      return res
        .status(400)
        .json({ message: "Examinee with this email already exists" });
    }

    const examinee = new Examinee(req.body);
    await examinee.save();

    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #e3f2fd, #ffffff); padding: 40px;">
        <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(90deg, #007bff, #00c6ff); padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Softpro!</h1>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 18px; color: #333;"><strong>Dear ${name},</strong></p>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              We're excited to welcome you to the Softpro Exam Prep. Your registration was successful, and your account is now active.
            </p>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              You can now log in to access your dashboard, take exams, track your progress, and explore learning resources.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://computer-excellance-academy.vercel.app/login" style="background: #007bff; color: #fff; padding: 12px 24px; font-size: 16px; border-radius: 6px; text-decoration: none; display: inline-block;">
                Log in to Your Account
              </a>
            </div>

            <p style="font-size: 16px; color: #555;">
              If you have any questions or face issues logging in, feel free to contact our support team.
            </p>

            <p style="margin-top: 30px; font-size: 16px; color: #333;">
              Best regards,<br>
              <strong>Team Softpro</strong>
            </p>
          </div>

          <div style="background-color: #f1f1f1; text-align: center; padding: 20px; font-size: 12px; color: #777;">
            This is an automated message. Please do not reply to this email.
          </div>
        </div>
      </div>
    `;

    setTimeout(async () => {
      try {
        await sendEmail(email, "Welcome to the exam portal", html);
      } catch (mailError) {
        console.error("Welcome email error:", mailError);
      }
    }, 100);

    return res.status(201).json({
      success: true,
      message: "Examinee registered successfully",
      data: examinee,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete examinee
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const examinee = await Examinee.findByIdAndDelete(id);

    if (!examinee) {
      return res.status(404).json({ message: "Examinee not found" });
    }

    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete examinee error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const examinee = await Examinee.findOne({ email });
    if (!examinee) {
      return res.status(404).json({ message: "Your Email Incorrect" });
    }

    if (examinee.password !== password) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    examinee.lastLoginAt = new Date();
    await examinee.save();

    return res.json({
      message: "Login Successfully",
      user: {
        email: examinee.email,
        role: "user",
        id: examinee._id,
        name: examinee.name,
        purchasedBatches: examinee.purchasedBatches || [],
      },
    });
  } catch (error) {
    console.error("Examinee login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// Change password
router.put("/change/:id", async (req, res) => {
  try {
    const { op, np, cnp } = req.body;

    const examinee = await Examinee.findById(req.params.id);

    if (!examinee) {
      return res.status(404).json({ message: "User not found" });
    }

    if (examinee.password !== op) {
      return res.json({ message: "Old password is incorrect" });
    }

    if (np !== cnp) {
      return res.json({
        message: "New password and confirm password do not match",
      });
    }

    await Examinee.findByIdAndUpdate(
      req.params.id,
      { password: np },
      { new: true }
    );

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      message: "Server error while changing password",
    });
  }
});

module.exports = router;
