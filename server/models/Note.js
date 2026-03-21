const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    chapter: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    videoLink: {
      type: String,
      default: "",
      trim: true,
    },
    externalLink: {
      type: String,
      default: "",
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);