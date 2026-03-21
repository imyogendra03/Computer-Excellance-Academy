const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// PDF upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/notes";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `note_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Upload PDF
router.post("/upload-pdf", (req, res) => {
  upload.single("pdf")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }
    const fileUrl = `https://computer-excellance-academy.onrender.com/uploads/notes/${req.file.filename}`;
    console.log("PDF uploaded:", fileUrl);
    return res.status(200).json({ success: true, fileUrl });
  });
});

// Create note
router.post("/", async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();
    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error("Create note error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all notes (admin)
router.get("/", async (req, res) => {
  try {
    const { courseId, type, subject } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (type) filter.type = type;
    if (subject) filter.subject = subject;

    const notes = await Note.find(filter)
      .populate("course")
      .sort({ order: 1, createdAt: -1 });

    return res.json({ success: true, data: notes });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Get notes for user
router.get("/user", async (req, res) => {
  try {
    const { courseId, type, subject } = req.query;
    const filter = { isPublished: true, status: "active" };
    if (courseId) filter.course = courseId;
    if (type) filter.type = type;
    if (subject) filter.subject = subject;

    const notes = await Note.find(filter)
      .populate("course")
      .sort({ order: 1, createdAt: -1 });

    return res.json({ success: true, data: notes });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Get single note
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("course");
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json({ success: true, data: note });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Update note
router.put("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json({ success: true, data: note });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.fileUrl) {
      const filePath = note.fileUrl.replace("https://computer-excellance-academy.onrender.com/", "");
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;