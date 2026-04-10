const express = require("express");
const router = express.Router();
const Batch = require("../models/Batch");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Content = require("../models/Content");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { readThroughCache, invalidateNamespace } = require("../utils/responseCache");

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      course,
      batchName,
      batchCode,
      description,
      price,
      discountPrice,
      startDate,
      endDate,
      duration,
      mode,
      features,
      thumbnail,
      maxStudents,
      enrolledStudents,
      isPublished,
      accessStatus,
      status,
      createdBy,
    } = req.body;

    const batch = new Batch({
      course,
      batchName,
      batchCode,
      description,
      price,
      discountPrice,
      startDate,
      endDate,
      duration,
      mode,
      features,
      thumbnail,
      maxStudents,
      enrolledStudents,
      isPublished,
      accessStatus,
      status,
      createdBy,
    });

    await batch.save();
    await invalidateNamespace("batches");

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Create batch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { published, courseId } = req.query;
    const filter = {};

    if (published === "true") {
      filter.isPublished = true;
      filter.status = "active";
      filter.accessStatus = "open";
    }

    if (courseId) {
      filter.course = courseId;
    }

    const cacheSuffix = `list:${published === "true" ? "published" : "all"}:${courseId || "all"}`;
    const batches = await readThroughCache("batches", cacheSuffix, 90, async () =>
      Batch.find(filter)
        .populate("course", "title slug category level duration thumbnail icon")
        .sort({ createdAt: -1 })
        .lean()
    );

    return res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Get batches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/course/:courseId", async (req, res) => {
  try {
    const batches = await readThroughCache("batches", `course:${req.params.courseId}`, 90, async () =>
      Batch.find({
        course: req.params.courseId,
        status: "active",
      })
        .populate("course", "title slug category level duration thumbnail icon")
        .sort({ createdAt: -1 })
        .lean()
    );

    return res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Get course batches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/preview/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("course", "title slug category level duration thumbnail icon shortDescription fullDescription")
      .lean();

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    const [subjects, chapters, contents] = await Promise.all([
      Subject.find({ batchId: batch._id, status: "active" })
        .select("title subjectname description order")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
      Chapter.find({ batchId: batch._id, status: "active" })
        .select("title description subjectId order")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
      Content.find({ batchId: batch._id, isPublished: true })
        .select("title description type resourceFormat subjectId chapterId order duration thumbnail")
        .sort({ order: 1, createdAt: 1 })
        .lean(),
    ]);

    const chapterMap = chapters.reduce((acc, chapter) => {
      const subjectKey = String(chapter.subjectId);
      acc[subjectKey] = acc[subjectKey] || [];
      acc[subjectKey].push({
        _id: chapter._id,
        title: chapter.title,
        description: chapter.description || "",
        order: chapter.order || 0,
        items: contents
          .filter((item) => String(item.chapterId) === String(chapter._id))
          .map((item) => ({
            _id: item._id,
            title: item.title,
            description: item.description || "",
            type: item.type,
            resourceFormat: item.resourceFormat,
            order: item.order || 0,
            duration: item.duration || 0,
            thumbnail: item.thumbnail || "",
            locked: true,
          })),
      });
      return acc;
    }, {});

    const previewSubjects = subjects.map((subject) => ({
      _id: subject._id,
      title: subject.title || subject.subjectname || "Untitled Subject",
      description: subject.description || "",
      order: subject.order || 0,
      chapters: (chapterMap[String(subject._id)] || []).sort((a, b) => a.order - b.order),
    }));

    const summary = contents.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.type === "video") acc.videos += 1;
        if (item.type === "note") acc.notes += 1;
        if (item.type === "dpp") acc.dpps += 1;
        if (item.type === "solution") acc.solutions += 1;
        return acc;
      },
      { total: 0, videos: 0, notes: 0, dpps: 0, solutions: 0 }
    );

    return res.json({
      success: true,
      data: {
        batch,
        summary,
        subjects: previewSubjects,
      },
    });
  } catch (error) {
    console.error("Get batch preview error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const batch = await readThroughCache("batches", `id:${req.params.id}`, 180, async () =>
      Batch.findById(req.params.id)
        .populate("course", "title slug category level duration thumbnail icon shortDescription")
        .lean()
    );

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    return res.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error("Get batch by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      course,
      batchName,
      batchCode,
      description,
      price,
      discountPrice,
      startDate,
      endDate,
      duration,
      mode,
      features,
      thumbnail,
      maxStudents,
      enrolledStudents,
      isPublished,
      accessStatus,
      status,
    } = req.body;

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        course,
        batchName,
        batchCode,
        description,
        price,
        discountPrice,
        startDate,
        endDate,
        duration,
        mode,
        features,
        thumbnail,
        maxStudents,
        enrolledStudents,
        isPublished,
        accessStatus,
        status,
      },
      { new: true }
    ).populate("course");

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await invalidateNamespace("batches");

    return res.json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Update batch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/price", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { price, discountPrice } = req.body;

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      { price, discountPrice },
      { new: true }
    ).populate("course");

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await invalidateNamespace("batches");

    return res.json({
      success: true,
      message: "Batch price updated successfully",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Update batch price error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/publish", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isPublished } = req.body;

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { new: true }
    ).populate("course");

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await invalidateNamespace("batches");

    return res.json({
      success: true,
      message: "Batch publish status updated",
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Batch publish error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedBatch = await Batch.findByIdAndDelete(req.params.id);

    if (!deletedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    await invalidateNamespace("batches");

    return res.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Delete batch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
