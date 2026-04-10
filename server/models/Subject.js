const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectname: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
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
  {
    timestamps: true,
  }
);

subjectSchema.pre("validate", function normalizeSubject(next) {
  if (!this.subjectname && this.title) {
    this.subjectname = this.title;
  }

  if (!this.title && this.subjectname) {
    this.title = this.subjectname;
  }

  next();
});

subjectSchema.index({ batchId: 1, order: 1, createdAt: 1 });
subjectSchema.index({ subjectname: 1, batchId: 1 }, { unique: false });

module.exports = mongoose.model("Subject", subjectSchema);
