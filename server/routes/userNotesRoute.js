const express = require("express");
const router = express.Router();
const Examinee = require("../models/Examinee");
const Content = require("../models/Content");
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");

// GET /api/notes/user?userId=...
// Returns ALL batch content (notes, videos, dpp, solution) for batches user has access to
router.get("/user", async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    // Find user and their purchased batches
    const user = await Examinee.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const batchIds = (user.purchasedBatches || [])
      .filter(b => b.accessStatus === "active")
      .map(b => b.batch);
    if (!batchIds.length) return res.json({ success: true, data: [] });

    // Get all content for these batches
    const contents = await Content.find({ batchId: { $in: batchIds } })
      .populate("subjectId", "title subjectname")
      .populate("batchId", "batchName course")
      .lean();

    // Attach subject, batch, and course info
    const result = contents.map(c => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      subject: c.subjectId?.title || c.subjectId?.subjectname || "General",
      fileUrl: c.url,
      type: c.type,
      resourceFormat: c.resourceFormat,
      batch: c.batchId?.batchName || "",
      course: c.batchId?.course || null,
      createdAt: c.createdAt,
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("[ERROR] User Notes Route:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
