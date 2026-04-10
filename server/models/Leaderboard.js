const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examinee",
      required: true,
    },
    quizScore: { type: Number, default: 0 },       // percentage 0-100
    testScore: { type: Number, default: 0 },        // percentage 0-100
    attendanceScore: { type: Number, default: 0 },  // percentage 0-100
    totalScore: { type: Number, default: 0 },       // computed composite
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leaderboardSchema.index({ batch: 1, totalScore: -1 });
leaderboardSchema.index({ batch: 1, student: 1 }, { unique: true });

// Virtual to compute totalScore from formula
leaderboardSchema.methods.computeTotal = function () {
  this.totalScore =
    (this.quizScore * 0.5) +
    (this.testScore * 0.3) +
    (this.attendanceScore * 0.2);
  return this.totalScore;
};

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
