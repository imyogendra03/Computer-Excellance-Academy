const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value must be positive"],
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      required: true,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableBatches: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
      default: [], // empty = applies to ALL batches
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Redundant index removed because 'unique: true' already creates one
couponSchema.index({ isActive: 1, expiryDate: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
