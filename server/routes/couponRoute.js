const express = require("express");
const router = express.Router();

const Coupon = require("../models/Coupon");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// ── Admin: Create coupon ──────────────────────────────────────────────────
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, maxUses, applicableBatches, isActive } = req.body;
    if (!code || !discountType || discountValue === undefined || !expiryDate || !maxUses) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Coupon code already exists." });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate,
      maxUses,
      applicableBatches: applicableBatches || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, message: "Coupon created.", data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: List all coupons ───────────────────────────────────────────────
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("applicableBatches", "batchName").sort({ createdAt: -1 });
    return res.json({ success: true, data: coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Update coupon (enable/disable) ────────────────────────────────
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Delete coupon ──────────────────────────────────────────────────
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Coupon deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Public: Validate coupon ───────────────────────────────────────────────
// POST /api/coupon/validate  body: { code, batchId }
router.post("/validate", authMiddleware, async (req, res) => {
  try {
    const { code, batchId, originalAmount } = req.body;
    if (!code || !batchId) {
      return res.status(400).json({ success: false, message: "code and batchId are required." });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code." });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "This coupon is no longer active." });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: "Coupon code has expired." });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached." });
    }

    // Check batch applicability
    if (coupon.applicableBatches.length > 0) {
      const isApplicable = coupon.applicableBatches.some(
        (b) => String(b) === String(batchId)
      );
      if (!isApplicable) {
        return res.status(400).json({ success: false, message: "Coupon is not applicable for this batch." });
      }
    }

    // Calculate final amount
    let discount = 0;
    const amount = Number(originalAmount) || 0;
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else if (coupon.discountType === "percentage") {
      discount = Math.round((coupon.discountValue / 100) * amount);
    }
    const finalAmount = Math.max(0, amount - discount);

    return res.json({
      success: true,
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      finalAmount,
      couponId: coupon._id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
