const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Chapter = require("../models/Chapter");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// @route   POST api/chapter
// @desc    Create a new chapter
// @access  Admin
router.post("/", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { title, batchId, subjectId, order, status } = req.body;

    if (!title || !batchId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${!title ? "title " : ""}${!batchId ? "batchId " : ""}${!subjectId ? "subjectId" : ""}`,
      });
    }

    if (!mongoose.isValidObjectId(batchId) || !mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batchId or subjectId.",
      });
    }

    const chapter = await Chapter.create({
      title: title.trim(),
      batchId,
      subjectId,
      order: Number(order) || 0,
      status: status || "active",
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      data: chapter,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET api/chapter
// @desc    Get chapters by batch/subject
// @access  Admin
router.get("/", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { batchId, subjectId } = req.query;
    const filter = {};
    if (batchId) filter.batchId = batchId;
    if (subjectId) filter.subjectId = subjectId;

    const chapters = await Chapter.find(filter).sort({ order: 1, createdAt: 1 }).lean();
    return res.json({ success: true, data: chapters });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE api/chapter/:id
// @desc    Delete a chapter
// @access  Admin
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found." });
    }
    return res.json({ success: true, message: "Chapter deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// @route   PUT api/chapter/:id
// @desc    Update a chapter
// @access  Admin
router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found." });
    }
    return res.json({ success: true, data: chapter });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
