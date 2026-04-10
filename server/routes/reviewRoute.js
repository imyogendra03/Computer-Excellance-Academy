const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// ── Student: Submit review ────────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { batchId, rating, reviewText } = req.body;
    const studentId = req.userId || req.user?._id;

    if (!rating || !reviewText) {
      return res.status(400).json({ success: false, message: "Rating and reviewText are required." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const existing = await Review.findOne({ student: studentId, batch: batchId });
    if (existing) {
      return res.status(409).json({ success: false, message: "You have already submitted a review for this batch." });
    }

    const review = await Review.create({
      student: studentId,
      batch: batchId,
      rating,
      reviewText,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted. It will appear once approved by admin.",
      data: review,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Get all pending reviews ───────────────────────────────────────
router.get("/pending", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" })
      .populate("student", "name email")
      .populate("batch", "batchName")
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Get all reviews ────────────────────────────────────────────────
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("student", "name email")
      .populate("batch", "batchName")
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Public: Get approved reviews (for homepage) ───────────────────────────
router.get("/approved", async (req, res) => {
  try {
    const reviews = await Review.find({ status: "approved" })
      .populate("student", "name")
      .populate("batch", "batchName")
      .sort({ updatedAt: -1 })
      .limit(20);
    return res.json({ success: true, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Approve review ─────────────────────────────────────────────────
router.put("/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    return res.json({ success: true, message: "Review approved.", data: review });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Reject review (silent delete) ─────────────────────────────────
router.put("/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Review rejected and removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
