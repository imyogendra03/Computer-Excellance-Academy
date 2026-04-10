const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { readThroughCache, invalidateNamespace } = require("../utils/responseCache");

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      fullDescription,
      category,
      level,
      duration,
      lessons,
      students,
      thumbnail,
      icon,
      highlightTag,
      isPublished,
      status,
      createdBy,
    } = req.body;

    const existingCourse = await Course.findOne({ slug: String(slug).toLowerCase() });
    if (existingCourse) {
      return res.status(400).json({ message: "Course with this slug already exists" });
    }

    const course = new Course({
      title,
      slug,
      shortDescription,
      fullDescription,
      category,
      level,
      duration,
      lessons,
      students,
      thumbnail,
      icon,
      highlightTag,
      isPublished,
      status,
      createdBy,
    });

    await course.save();
    await invalidateNamespace("courses");

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { published } = req.query;

    const filter = {};

    if (published === "true") {
      filter.isPublished = true;
      filter.status = "active";
    }

    const cacheSuffix = `list:${published === "true" ? "published" : "all"}`;
    const courses = await readThroughCache("courses", cacheSuffix, 120, async () =>
      Course.find(filter)
        .select("title slug shortDescription fullDescription category level duration lessons students thumbnail icon highlightTag isPublished status createdAt")
        .sort({ createdAt: -1 })
        .lean()
    );

    return res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const course = await readThroughCache("courses", `slug:${slug}`, 300, async () =>
      Course.findOne({ slug })
        .lean()
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course by slug error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await readThroughCache("courses", `id:${req.params.id}`, 300, async () =>
      Course.findById(req.params.id).lean()
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      fullDescription,
      category,
      level,
      duration,
      lessons,
      students,
      thumbnail,
      icon,
      highlightTag,
      isPublished,
      status,
    } = req.body;

    const existingSlug = await Course.findOne({
      slug: String(slug).toLowerCase(),
      _id: { $ne: req.params.id },
    });

    if (existingSlug) {
      return res.status(400).json({ message: "Another course already uses this slug" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        shortDescription,
        fullDescription,
        category,
        level,
        duration,
        lessons,
        students,
        thumbnail,
        icon,
        highlightTag,
        isPublished,
        status,
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    await invalidateNamespace("courses");

    return res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/publish", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isPublished } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    await invalidateNamespace("courses");

    return res.json({
      success: true,
      message: "Course publish status updated",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Publish course error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    await invalidateNamespace("courses");

    return res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
