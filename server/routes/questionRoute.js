const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Question = require("../models/Questionbank");
const Subject = require("../models/Subject");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { extractQuestionsFromPdf, generateQuestionsByTopic } = require("../utils/aiQuestionExtractor");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

const normalizeQuestionPayload = (payload = {}, sourceType = "manual", sourceFileName = "") => {
  return {
    question: String(payload.question || "").trim(),
    optionA: String(payload.optionA || "").trim(),
    optionB: String(payload.optionB || "").trim(),
    optionC: String(payload.optionC || "").trim(),
    optionD: String(payload.optionD || "").trim(),
    correctAnswer: String(payload.correctAnswer || "").trim().toUpperCase(),
    subject: String(payload.subject || "").trim(),
    sourceType,
    sourceFileName,
  };
};

const validateQuestionPayload = async (payload) => {
  if (
    !payload.question ||
    !payload.optionA ||
    !payload.optionB ||
    !payload.optionC ||
    !payload.optionD ||
    !payload.correctAnswer ||
    !payload.subject
  ) {
    return "All question fields are required.";
  }

  if (!["A", "B", "C", "D"].includes(payload.correctAnswer)) {
    return "Correct answer must be one of A, B, C, or D.";
  }

  if (!mongoose.Types.ObjectId.isValid(payload.subject)) {
    return "Invalid subject selected.";
  }

  const subjectExists = await Subject.exists({ _id: payload.subject });
  if (!subjectExists) {
    return "Selected subject does not exist.";
  }

  return "";
};

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payload = normalizeQuestionPayload(req.body, "manual");
    const validationError = await validateQuestionPayload(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    await Question.create(payload);
    return res.json({ success: true, message: "Question added successfully." });
  } catch (error) {
    console.error("Question create error:", error);
    return res.status(500).json({ success: false, message: "Failed to add question." });
  }
});

router.post("/bulk", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.questions) ? req.body.questions : [];
    if (!items.length) {
      return res.status(400).json({ success: false, message: "Questions array is required." });
    }

    const normalizedItems = [];
    for (const item of items) {
      const payload = normalizeQuestionPayload(item, item.sourceType || "manual", item.sourceFileName || "");
      const validationError = await validateQuestionPayload(payload);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }
      normalizedItems.push(payload);
    }

    const inserted = await Question.insertMany(normalizedItems, { ordered: false });
    return res.status(201).json({
      success: true,
      message: "Questions imported successfully.",
      data: inserted,
    });
  } catch (error) {
    console.error("Bulk question import error:", error);
    return res.status(500).json({ success: false, message: "Failed to import questions." });
  }
});

router.post(
  "/extract-pdf",
  authMiddleware,
  adminMiddleware,
  upload.single("pdf"),
  async (req, res) => {
    try {
      const { subject, questionLimit } = req.body;
      if (!req.file) {
        return res.status(400).json({ success: false, message: "PDF file is required." });
      }

      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ success: false, message: "Valid subject is required." });
      }

      const subjectDoc = await Subject.findById(subject);
      if (!subjectDoc) {
        return res.status(404).json({ success: false, message: "Subject not found." });
      }

      const questions = await extractQuestionsFromPdf({
        pdfBuffer: req.file.buffer,
        subjectId: subjectDoc._id,
        subjectName: subjectDoc.subjectname,
        sourceFileName: req.file.originalname,
        questionLimit,
      });

      const inserted = await Question.insertMany(questions, { ordered: false });
      return res.status(201).json({
        success: true,
        message: `${inserted.length} questions imported from PDF.`,
        data: inserted,
      });
    } catch (error) {
      console.error("PDF question extraction error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to extract questions from PDF.",
      });
    }
  }
);

router.post("/generate-topic", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { subject, topic, questionLimit, difficulty } = req.body || {};

    if (!topic || !String(topic).trim()) {
      return res.status(400).json({ success: false, message: "Topic is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ success: false, message: "Valid subject is required." });
    }

    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.status(404).json({ success: false, message: "Subject not found." });
    }

    const questions = await generateQuestionsByTopic({
      subjectId: subjectDoc._id,
      subjectName: subjectDoc.subjectname,
      topic: String(topic).trim(),
      questionLimit,
      difficulty: String(difficulty || "medium").trim().toLowerCase(),
    });

    const inserted = await Question.insertMany(questions, { ordered: false });
    return res.status(201).json({
      success: true,
      message: `${inserted.length} topic-based questions generated.`,
      data: inserted,
    });
  } catch (error) {
    console.error("Topic question generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate topic-based questions.",
    });
  }
});

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const questions = await Question.find().populate("subject").sort({ createdAt: -1 });
    return res.json({ success: true, data: questions });
  } catch (error) {
    console.error("Question fetch error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch questions." });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Deleted successfully." });
  } catch (error) {
    console.error("Question delete error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete question." });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payload = normalizeQuestionPayload(req.body, req.body?.sourceType || "manual", req.body?.sourceFileName || "");
    const validationError = await validateQuestionPayload(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    await Question.findByIdAndUpdate(req.params.id, payload, { new: true });
    return res.json({ success: true, message: "Updated successfully." });
  } catch (error) {
    console.error("Question update error:", error);
    return res.status(500).json({ success: false, message: "Failed to update question." });
  }
});

module.exports = router;
