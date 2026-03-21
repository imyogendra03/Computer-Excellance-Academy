const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batchName: {
      type: String,
      required: true,
      trim: true,
    },
    batchCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    mode: {
      type: String,
      enum: ["online", "offline", "recorded", "live"],
      default: "online",
    },
    features: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
      default: "",
      trim: true,
    },
    maxStudents: {
      type: Number,
      default: 0,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    accessStatus: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
