const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const Question = require("../models/Questionbank");
const Examination = require("../models/Examination");
const Examinee = require("../models/Examinee");
const ExamAttempted = require("../models/ExamAttempted");

const router = express.Router();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const buildDistributionQuestions = async (questionDistribution = []) => {
  const selectedQuestions = [];
  const normalizedDistribution = [];

  for (const dist of questionDistribution) {
    const subject = String(dist?.subject || "").trim();
    const questionCount = Number(dist?.numberOfQuestions || dist?.questionCount || 0);

    if (!isValidObjectId(subject)) {
      throw new Error(`Invalid subject ID: ${subject}`);
    }

    if (!questionCount || questionCount <= 0) {
      throw new Error("Each subject must have a valid number of questions.");
    }

    const questions = await Question.aggregate([
      { $match: { subject: new mongoose.Types.ObjectId(subject) } },
      { $sample: { size: questionCount } },
    ]);

    if (questions.length < questionCount) {
      throw new Error(`Not enough questions available for subject: ${subject}`);
    }

    normalizedDistribution.push({
      subject,
      questionCount,
    });

    selectedQuestions.push(...questions.map((question) => question._id));
  }

  return {
    selectedQuestions,
    normalizedDistribution,
  };
};

const buildManualQuestions = async (manualQuestionIds = []) => {
  const uniqueIds = [...new Set((manualQuestionIds || []).map((id) => String(id).trim()).filter(Boolean))];

  if (!uniqueIds.length) {
    throw new Error("Select at least one manual question.");
  }

  if (uniqueIds.some((id) => !isValidObjectId(id))) {
    throw new Error("Invalid manual question selected.");
  }

  const questions = await Question.find({ _id: { $in: uniqueIds } }).select("_id subject");
  if (questions.length !== uniqueIds.length) {
    throw new Error("One or more selected questions were not found.");
  }

  const subjectCounts = questions.reduce((acc, question) => {
    const key = String(question.subject);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const normalizedDistribution = Object.entries(subjectCounts).map(([subject, questionCount]) => ({
    subject,
    questionCount,
  }));

  return {
    selectedQuestions: uniqueIds,
    normalizedDistribution,
  };
};

const buildExamPayload = async (body = {}) => {
  const {
    examName,
    date,
    time,
    duration,
    totalMarks,
    passingMarks,
    sessionId,
    status,
    questionMode = "distribution",
    questionDistribution = [],
    manualQuestionIds = [],
  } = body;

  if (!examName || !date || !time || !duration || !totalMarks || !passingMarks || !sessionId) {
    throw new Error("All required fields must be provided.");
  }

  if (!isValidObjectId(sessionId)) {
    throw new Error(`Invalid session ID: ${sessionId}`);
  }

  const mode = questionMode === "manual" ? "manual" : "distribution";
  const questionPayload =
    mode === "manual"
      ? await buildManualQuestions(manualQuestionIds)
      : await buildDistributionQuestions(questionDistribution);

  return {
    title: examName,
    date,
    time,
    duration,
    totalMarks,
    passingMarks,
    sessionId,
    status: status || "Scheduled",
    questionMode: mode,
    questionDistribution: questionPayload.normalizedDistribution,
    questions: questionPayload.selectedQuestions,
  };
};

const ensureExamQuestions = async (exam) => {
  if (Array.isArray(exam?.questions) && exam.questions.length) {
    const populatedQuestions =
      typeof exam.questions[0] === "object" && exam.questions[0]?.question
        ? exam.questions
        : await Question.find({ _id: { $in: exam.questions } });

    return populatedQuestions;
  }

  if (exam?.questionMode === "manual") {
    return [];
  }

  const fallback = await buildDistributionQuestions(exam?.questionDistribution || []);
  exam.questions = fallback.selectedQuestions;
  exam.questionDistribution = fallback.normalizedDistribution;
  await exam.save();

  return Question.find({ _id: { $in: fallback.selectedQuestions } });
};

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payload = await buildExamPayload(req.body);
    const savedExam = await Examination.create(payload);
    const hydratedExam = await Examination.findById(savedExam._id)
      .populate("sessionId", "name")
      .populate("questionDistribution.subject", "subjectname")
      .populate("questions", "question correctAnswer subject");

    return res.status(201).json({ success: true, data: hydratedExam });
  } catch (error) {
    console.error("Error creating exam:", error);
    return res.status(400).json({ success: false, error: error.message || "Failed to create exam." });
  }
});

router.get("/exams", authMiddleware, async (req, res) => {
  try {
    const exams = await Examination.find({})
      .populate("sessionId", "name")
      .populate("questionDistribution.subject", "subjectname")
      .populate("questions", "question subject")
      .sort({ createdAt: -1 });

    return res.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return res.status(500).json({ error: "Error fetching exams" });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: `Invalid exam ID: ${id}` });
    }

    const payload = await buildExamPayload(req.body);
    const updatedExam = await Examination.findByIdAndUpdate(id, payload, { new: true })
      .populate("sessionId", "name")
      .populate("questionDistribution.subject", "subjectname")
      .populate("questions", "question correctAnswer subject");

    if (!updatedExam) {
      return res.status(404).json({ success: false, error: "Exam not found" });
    }

    return res.json({ success: true, data: updatedExam });
  } catch (error) {
    console.error("Error updating exam:", error);
    return res.status(400).json({ success: false, error: error.message || "Error updating exam" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: `Invalid exam ID: ${id}` });
    }

    const deletedExam = await Examination.findByIdAndDelete(id);
    if (!deletedExam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    return res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return res.status(500).json({ error: "Error deleting exam" });
  }
});

router.get("/exam/:examId", authMiddleware, async (req, res) => {
  try {
    const { examId } = req.params;
    if (!isValidObjectId(examId)) {
      return res.status(400).json({ error: `Invalid exam ID: ${examId}` });
    }

    const exam = await Examination.findById(examId)
      .populate("questionDistribution.subject", "subjectname")
      .populate("questions")
      .populate("sessionId", "name");

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const questions = await ensureExamQuestions(exam);

    return res.json({
      exam: {
        _id: exam._id,
        title: exam.title,
        date: exam.date,
        time: exam.time,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        status: exam.status,
        questionMode: exam.questionMode,
        sessionName: exam.sessionId?.name || "",
      },
      questions,
    });
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/submit-exam", authMiddleware, async (req, res) => {
  try {
    const { examId, answers = {}, email } = req.body;
    if (!isValidObjectId(examId)) {
      return res.status(400).json({ error: `Invalid exam ID: ${examId}` });
    }

    const user = await Examinee.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exam = await Examination.findById(examId).populate("questions");
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const questionList = await ensureExamQuestions(exam);
    if (!questionList.length) {
      return res.status(400).json({ error: "This exam has no questions assigned." });
    }

    let score = 0;
    const totalMarks = Number(exam.totalMarks);
    const marksPerQuestion = totalMarks / questionList.length;

    questionList.forEach((question) => {
      const submittedAnswer = answers[question._id];
      const isCorrect = submittedAnswer === question.correctAnswer;
      if (isCorrect) {
        score += marksPerQuestion;
      }
    });

    const passed = score >= Number(exam.passingMarks);

    const examAttempted = new ExamAttempted({
      examineeId: user._id,
      examId: exam._id,
      score,
      totalMarks,
      passingMarks: Number(exam.passingMarks),
      status: passed ? "Passed" : "Failed",
      resultStatus: "Pending",
    });

    await examAttempted.save();
    return res.json({ message: "Exam submitted successfully" });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return res.status(500).json({ error: "Failed to submit exam" });
  }
});

router.get("/report", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const exams = await ExamAttempted.find().populate("examineeId").populate("examId");

    const report = exams.map((exam) => ({
      examineeEmail: exam.examineeId?.email || "N/A",
      examineeName: exam.examineeId?.name || "N/A",
      examTitle: exam.examId?.title || "Exam Deleted",
      score: exam.score,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      status: exam.status,
      resultStatus: exam.resultStatus,
      attemptedAt: exam.createdAt,
    }));

    return res.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    return res.status(500).json({ error: "Failed to generate report" });
  }
});

router.post("/result/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const exam = await ExamAttempted.findByIdAndUpdate(
      req.params.id,
      { resultStatus: "Completed", updatedAt: new Date() },
      { new: true }
    ).populate("examId");

    if (!exam) {
      return res.status(404).json({ message: "Exam attempt not found" });
    }

    return res.json({ message: "Result declared successfully", exam });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error while declaring result" });
  }
});

router.get("/examination", authMiddleware, adminMiddleware, async (req, res) => {
  const examination = await ExamAttempted.find({ resultStatus: "Pending" }).populate("examId");
  return res.json({ message: examination });
});

router.get("/examinee-result/:id", authMiddleware, async (req, res) => {
  try {
    const examination = await ExamAttempted.find({
      resultStatus: "Completed",
      examineeId: req.params.id,
    })
      .populate("examId")
      .populate("examineeId");

    return res.json({ message: examination });
  } catch (error) {
    console.error("Error fetching examinee result:", error);
    return res.status(500).json({ error: "Failed to fetch result" });
  }
});

module.exports = router;
