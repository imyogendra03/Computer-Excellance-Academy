const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examinee",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "manual",
      trim: true,
    },
    gatewayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
    purchaseStage: {
      type: String,
      enum: [
        "explored",
        "order_created",
        "payment_pending",
        "payment_successful",
        "payment_failed",
        "access_granted",
      ],
      default: "payment_successful",
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    exploredAt: {
      type: Date,
      default: null,
    },
    lastStageAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    originalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ user: 1, batch: 1, createdAt: -1 });
paymentSchema.index({ user: 1, batch: 1, paymentStatus: 1, purchaseStage: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
