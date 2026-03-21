const express = require("express");
const router = express.Router();
const Batch = require("../models/Batch");

// Create batch
router.post("/", async (req, res) => {
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

// Get all batches
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

    const batches = await Batch.find(filter)
      .populate("course")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Get batches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get batches by course id
router.get("/course/:courseId", async (req, res) => {
  try {
    const batches = await Batch.find({
      course: req.params.courseId,
      status: "active",
    })
      .populate("course")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Get course batches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get single batch by id
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate("course");

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

// Update batch
router.put("/:id", async (req, res) => {
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

// Update batch price
router.patch("/:id/price", async (req, res) => {
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

// Update batch publish status
router.patch("/:id/publish", async (req, res) => {
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

// Delete batch
router.delete("/:id", async (req, res) => {
  try {
    const deletedBatch = await Batch.findByIdAndDelete(req.params.id);

    if (!deletedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

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
