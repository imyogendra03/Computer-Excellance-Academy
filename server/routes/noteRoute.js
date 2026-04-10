const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const Content = require("../models/Content");
const Batch = require("../models/Batch");

// Public Notes Endpoint - Simplified for Reliability
router.get("/public", async (req, res) => {
  try {
    const { courseId, subject } = req.query;
    console.log("[LOG] Notes Public Request:", { courseId, subject });

    // 1. Determine which batches we should look into
    let batchIds = [];
    if (courseId && courseId !== "all" && courseId !== "undefined") {
      const batches = await Batch.find({ course: courseId }).distinct("_id");
      batchIds = batches;
    }

    // 2. Build Queries
    const standaloneFilter = { status: "active", isPublished: true };
    if (courseId && courseId !== "all" && courseId !== "undefined") {
      standaloneFilter.course = courseId;
    }

    const contentFilter = { resourceFormat: "pdf" };
    if (batchIds.length > 0) {
      contentFilter.batchId = { $in: batchIds };
    } else if (courseId && courseId !== "all" && courseId !== "undefined") {
      // If course selected but no batches found, return nothing for batch content
      contentFilter.batchId = { $in: [] };
    }

    // 3. Parallel Fetching
    const [sc, bc] = await Promise.all([
      Note.find(standaloneFilter).populate("course", "title").lean(),
      Content.find(contentFilter)
        .populate("batchId", "batchName")
        .populate("subjectId", "title subjectname")
        .lean()
    ]);

    // 4. Transform Batch Content (Mirroring NotesTab logic)
    const normalizedBatch = bc.map(n => ({
      _id: n._id,
      title: n.title,
      description: n.description || "Study material from batch.",
      subject: n.subjectId?.title || n.subjectId?.subjectname || "General",
      fileUrl: n.url,
      type: "free",
      category: (n.type || "PDF").toUpperCase(),
      course: { title: n.batchId?.batchName || "Batch Content" },
      createdAt: n.createdAt
    }));

    // 5. Merge and Subject Filter
    let merged = [...sc, ...normalizedBatch];

    if (subject && subject !== "undefined" && subject !== "") {
      const term = subject.toLowerCase().trim();
      merged = merged.filter(item => 
        (item.subject && String(item.subject).toLowerCase().includes(term)) ||
        (item.title && String(item.title).toLowerCase().includes(term))
      );
    }

    // 6. Final Sort
    merged.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("[LOG] Sending", merged.length, "notes to client");
    return res.json({ success: true, count: merged.length, data: merged });
  } catch (err) {
    console.error("[ERROR] Public Notes Route Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
