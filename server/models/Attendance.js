const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    examinee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examinee",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      default: "Present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ examinee: 1, batch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
