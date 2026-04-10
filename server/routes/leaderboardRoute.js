const express = require("express");
const router = express.Router();

const Leaderboard = require("../models/Leaderboard");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Helper: Recalculate and rank all students in a batch
async function recalculateRanks(batchId) {
  const entries = await Leaderboard.find({ batch: batchId });
  for (const entry of entries) {
    entry.totalScore =
      (entry.quizScore * 0.5) +
      (entry.testScore * 0.3) +
      (entry.attendanceScore * 0.2);
    await entry.save();
  }

  // Sort descending and assign ranks
  const sorted = await Leaderboard.find({ batch: batchId }).sort({ totalScore: -1 });
  let rank = 1;
  for (const entry of sorted) {
    entry.rank = rank++;
    await entry.save();
  }
}

// ── Get leaderboard for a batch (public inside batch context) ─────────────
router.get("/:batchId", authMiddleware, async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ batch: req.params.batchId })
      .populate("student", "name email profileImage")
      .sort({ rank: 1 });

    return res.json({ success: true, data: leaderboard });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Update student score (called after quiz/test submission) ──────────────
// POST /api/leaderboard/update  body: { batchId, studentId, type: 'quiz'|'test'|'attendance', score }
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { batchId, studentId, type, score } = req.body;
    if (!batchId || !studentId || !type || score === undefined) {
      return res.status(400).json({ success: false, message: "batchId, studentId, type, and score are required." });
    }
    if (!["quiz", "test", "attendance"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be quiz, test, or attendance." });
    }

    let entry = await Leaderboard.findOne({ batch: batchId, student: studentId });
    if (!entry) {
      entry = new Leaderboard({ batch: batchId, student: studentId });
    }

    if (type === "quiz") entry.quizScore = score;
    else if (type === "test") entry.testScore = score;
    else if (type === "attendance") entry.attendanceScore = score;

    entry.totalScore =
      (entry.quizScore * 0.5) +
      (entry.testScore * 0.3) +
      (entry.attendanceScore * 0.2);

    await entry.save();

    // Re-rank all students in batch
    await recalculateRanks(batchId);

    return res.json({ success: true, message: "Score updated and leaderboard recalculated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ── Admin: Reset leaderboard for a batch ─────────────────────────────────
router.delete("/:batchId/reset", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Leaderboard.deleteMany({ batch: req.params.batchId });
    return res.json({ success: true, message: "Leaderboard reset successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
