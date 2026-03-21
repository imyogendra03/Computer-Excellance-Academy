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
    paidAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
