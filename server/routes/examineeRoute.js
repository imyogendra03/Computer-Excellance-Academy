const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const Examinee = require("../models/Examinee");
const Batch = require("../models/Batch");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  buildPurchasedBatchEntry,
  getBatchExpiryDate,
  syncPurchasedBatches,
} = require("../utils/batchAccess");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error("Only JPG and JPEG formats are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 }, // 50KB Max
  fileFilter: fileFilter
});

const populateExamineeAccess = (query) =>
  query
    .populate("purchasedBatches.batch")
    .populate("purchasedBatches.course")
    .populate("purchasedBatches.paymentId");

router.put("/:id", authMiddleware, upload.single("profileImage"), async (req, res) => {
  try {
    const {
      name,
      email,
      number,
      address,
      password,
      college,
      qualification,
      status,
      session,
    } = req.body;

    const updateData = { name, email, number, address, password, college, qualification, status, session };
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const updatedExaminee = await Examinee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedExaminee) {
      return res.status(404).json({ success: false, message: "Examinee not found" });
    }

    return res.json({ success: true, message: "Profile updated successfully", data: updatedExaminee });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id/my-batches", authMiddleware, async (req, res) => {
  try {
    const examinee = await populateExamineeAccess(Examinee.findById(req.params.id));
    if (!examinee) {
      return res.status(404).json({ message: "Examinee not found" });
    }

    await syncPurchasedBatches(examinee);

    return res.json({
      success: true,
      data: (examinee.purchasedBatches || []).sort(
        (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
      ),
    });
  } catch (error) {
    console.error("My batches error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const examinee = await Examinee.findById(req.params.id);
    if (!examinee) {
      return res.status(404).json({ message: "Examinee not found" });
    }
    return res.json({ data: examinee });
  } catch (error) {
    console.error("Fetch examinee error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const examinees = await populateExamineeAccess(Examinee.find()).sort({ createdAt: -1 });
    for (const examinee of examinees) {
      await syncPurchasedBatches(examinee);
    }
    return res.json({ data: examinees });
  } catch (error) {
    console.error("Fetch all examinees error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/batch-access", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { batchId, replaceBatchId, grantType = "free", accessStatus = "active" } = req.body || {};
    if (!batchId) {
      return res.status(400).json({ success: false, message: "batchId is required." });
    }

    const [user, batch] = await Promise.all([
      populateExamineeAccess(Examinee.findById(req.params.id)),
      Batch.findById(batchId).populate("course"),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found." });
    }

    if (replaceBatchId) {
      user.purchasedBatches = (user.purchasedBatches || []).filter(
        (item) => String(item.batch?._id || item.batch) !== String(replaceBatchId)
      );
    }

    const existingIndex = (user.purchasedBatches || []).findIndex(
      (item) => String(item.batch?._id || item.batch) === String(batchId)
    );

    const entry = buildPurchasedBatchEntry({
      batch,
      paymentId: null,
      accessType: grantType === "free" ? "free" : "paid",
      assignedByAdmin: true,
    });
    entry.accessStatus = accessStatus;
    entry.accessExpiresAt = getBatchExpiryDate(batch, entry.accessStartsAt);

    if (existingIndex >= 0) {
      user.purchasedBatches[existingIndex] = {
        ...user.purchasedBatches[existingIndex].toObject?.(),
        ...entry,
      };
    } else {
      user.purchasedBatches.push(entry);
    }

    await user.save();
    const refreshedUser = await populateExamineeAccess(Examinee.findById(user._id));
    await syncPurchasedBatches(refreshedUser);

    return res.json({
      success: true,
      message: grantType === "free" ? "Free batch assigned successfully." : "Batch access updated successfully.",
      data: refreshedUser.purchasedBatches,
    });
  } catch (error) {
    console.error("Assign batch access error:", error);
    return res.status(500).json({ success: false, message: "Failed to update batch access." });
  }
});

router.delete("/:id/batch-access/:batchId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await Examinee.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    user.purchasedBatches = (user.purchasedBatches || []).filter(
      (item) => String(item.batch) !== String(req.params.batchId)
    );
    await user.save();

    return res.json({ success: true, message: "Batch access removed successfully." });
  } catch (error) {
    console.error("Remove batch access error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove batch access." });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const examinee = await Examinee.findByIdAndDelete(req.params.id);
    if (!examinee) {
      return res.status(404).json({ message: "Examinee not found" });
    }
    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete examinee error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/change/:id", authMiddleware, async (req, res) => {
  try {
    const { op, np, cnp } = req.body;
    if (!op || !np || !cnp) {
      return res.status(400).json({ success: false, message: "All password fields are required." });
    }
    if (np !== cnp) {
      return res.status(400).json({ success: false, message: "New password and confirm password do not match." });
    }
    if (np.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const examinee = await Examinee.findById(req.params.id);
    if (!examinee) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(op, examinee.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Old password is incorrect." });
    }

    const hashed = await bcrypt.hash(np, 12);
    await Examinee.findByIdAndUpdate(req.params.id, { password: hashed });
    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while changing password." });
  }
});

router.get("/batch/:batchId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const students = await Examinee.find({
      "purchasedBatches.batch": req.params.batchId,
      status: "active",
    }).select("name email number purchasedBatches");

    return res.json({ success: true, data: students });
  } catch (error) {
    console.error("Fetch students by batch error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
