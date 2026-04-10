const mongoose = require("mongoose");

const purchasedBatchSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    accessStatus: {
      type: String,
      enum: ["active", "inactive", "expired", "pending", "rejected"],
      default: "active",
    },
    accessType: {
      type: String,
      enum: ["paid", "free"],
      default: "paid",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    accessStartsAt: {
      type: Date,
      default: Date.now,
    },
    accessExpiresAt: {
      type: Date,
      default: null,
    },
    assignedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const examineeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    profileImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "delete"],
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    purchasedBatches: {
      type: [purchasedBatchSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    currentSessionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Examinee", examineeSchema);
