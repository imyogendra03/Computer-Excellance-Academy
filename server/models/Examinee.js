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
      enum: ["active", "inactive"],
      default: "active",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
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
      trim: true,
      lowercase: true,
    },
    number: {
      type: String,
      required: true,
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

    // Future-ready fields for course and batch module
    purchasedBatches: {
      type: [purchasedBatchSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ExamineeSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String },
  refreshToken:     { type: String },   // latest refresh token store
}, { timestamps: true });


module.exports = mongoose.model("Examinee", examineeSchema);
