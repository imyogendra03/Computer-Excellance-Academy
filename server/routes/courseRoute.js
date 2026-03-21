const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Create course
router.post("/", async (req, res) => {
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

// Get all courses
router.get("/", async (req, res) => {
  try {
    const { published } = req.query;

    const filter = {};

    if (published === "true") {
      filter.isPublished = true;
      filter.status = "active";
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get course by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug.toLowerCase() });

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

// Get course by id
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

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

// Update course
router.put("/:id", async (req, res) => {
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

// Update course publish status
router.patch("/:id/publish", async (req, res) => {
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

// Delete course
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

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
