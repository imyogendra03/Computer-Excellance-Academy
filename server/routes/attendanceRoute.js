const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Leaderboard = require("../models/Leaderboard");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const mongoose = require("mongoose");

const recalculateBatchLeaderboard = async (batchId) => {
  const entries = await Leaderboard.find({ batch: batchId }).sort({ totalScore: -1, updatedAt: 1 });
  let rank = 1;
  for (const entry of entries) {
    entry.totalScore =
      (Number(entry.quizScore || 0) * 0.5) +
      (Number(entry.testScore || 0) * 0.3) +
      (Number(entry.attendanceScore || 0) * 0.2);
    entry.rank = rank++;
    await entry.save();
  }
};

const syncAttendanceLeaderboard = async (batchId, studentIds = []) => {
  const totalSessions = await Attendance.countDocuments({ batch: batchId });
  if (!totalSessions) {
    return;
  }

  const ids = [...new Set(studentIds.map((id) => String(id)).filter(Boolean))];
  for (const studentId of ids) {
    const presentCount = await Attendance.countDocuments({
      batch: batchId,
      examinee: studentId,
      status: { $in: ["Present", "Late"] },
    });

    const attendanceScore = Math.round((presentCount / totalSessions) * 100);
    const entry = await Leaderboard.findOneAndUpdate(
      { batch: batchId, student: studentId },
      { $set: { attendanceScore } },
      { new: true, upsert: true }
    );
    entry.totalScore =
      (Number(entry.quizScore || 0) * 0.5) +
      (Number(entry.testScore || 0) * 0.3) +
      (Number(entry.attendanceScore || 0) * 0.2);
    await entry.save();
  }

  await recalculateBatchLeaderboard(batchId);
};

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { examinee, batch, date, status, remarks } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      examinee,
      batch,
      date: attendanceDate,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Attendance already marked for this student today." });
    }

    const attendance = new Attendance({
      examinee,
      batch,
      date: attendanceDate,
      status,
      remarks,
      markedBy: req.user.id,
    });

    await attendance.save();
    await syncAttendanceLeaderboard(batch, [examinee]);
    return res.status(201).json({ success: true, message: "Attendance marked successfully", data: attendance });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/bulk", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { batch, date, attendanceData } = req.body;
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      const bulkOps = attendanceData.map(item => ({
        updateOne: {
          filter: { 
            examinee: item.examinee, 
            batch: batch, 
            date: attendanceDate 
          },
          update: { 
            $set: { 
              status: item.status, 
              remarks: item.remarks,
              markedBy: req.user.id 
            } 
          },
          upsert: true
        }
      }));

      await Attendance.bulkWrite(bulkOps);
      await syncAttendanceLeaderboard(
        batch,
        attendanceData.map((item) => item.examinee)
      );
      return res.json({ success: true, message: "Attendance updated successfully" });
    } catch (error) {
      console.error("Bulk attendance error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batch, startDate, endDate, status, examinee } = req.query;
    const filter = {};

    if (batch) filter.batch = batch;
    if (examinee) filter.examinee = examinee;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.date.$lte = e;
      }
    }

    const attendance = await Attendance.find(filter)
      .populate("examinee", "name email number")
      .populate("batch", "batchName")
      .sort({ date: -1 });

    return res.json({ success: true, data: attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/my-attendance", authMiddleware, async (req, res) => {
  try {
    const { batchId } = req.query;
    const filter = { examinee: req.user.id };
    if (batchId) filter.batch = batchId;

    const attendance = await Attendance.find(filter)
      .populate("batch", "batchName")
      .sort({ date: -1 });

    return res.json({ success: true, data: attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ success: false, message: "Record not found" });
    return res.json({ success: true, data: attendance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ success: false, message: "Record not found" });
    return res.json({ success: true, message: "Attendance record deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/students/:batchId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batchId } = req.params;
    const Examinee = require("../models/Examinee");

    let students = await Examinee.find({
      "purchasedBatches.batch": batchId,
      status: "active"
    }).select("name email number session purchasedBatches");

    if (students.length === 0) {
      students = await Examinee.find({
        session: batchId,
        status: "active"
      }).select("name email number session purchasedBatches");
    }

    if (students.length === 0) {
      students = await Examinee.find({ status: "active" })
        .select("name email number session purchasedBatches");
    }

    return res.json({ success: true, data: students, total: students.length });
  } catch (error) {
    console.error("Get students by batch error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
