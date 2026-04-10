const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const Message = require("../models/Message");
const Examinee = require("../models/Examinee");

const populateMessage = (query) =>
  query.populate("examineeId", "name email number");

const resolveSenderMeta = async (examineeId) => {
  if (!examineeId) return null;

  const user = await Examinee.findById(examineeId).select("name email number");
  if (!user) return null;

  return {
    senderName: user.name || "",
    senderEmail: user.email || "",
    senderPhone: user.number || "",
  };
};

router.post("/public", async (req, res) => {
  try {
    const { email, phone, question, description } = req.body;
    const messageText = (question || description || "").trim();

    if (!email || !phone || !messageText) {
      return res.status(400).json({
        success: false,
        message: "Email, mobile number, and query are required.",
      });
    }

    const msg = await Message.create({
      question: messageText,
      senderEmail: String(email).trim(),
      senderPhone: String(phone).trim(),
      source: "public-support",
    });

    return res.status(201).json({
      success: true,
      message: "Support request sent successfully.",
      data: msg,
    });
  } catch (err) {
    console.error("Error creating public support message:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { question, examineeId } = req.body;
    const trimmedQuestion = String(question || "").trim();

    if (!trimmedQuestion) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    if (!examineeId) {
      return res.status(400).json({ success: false, message: "examineeId required" });
    }

    if (req.userRole !== "admin" && req.userId !== String(examineeId)) {
      return res.status(403).json({ success: false, message: "Not allowed to send for another user." });
    }

    const senderMeta = await resolveSenderMeta(examineeId);

    const msg = await Message.create({
      question: trimmedQuestion,
      examineeId: new mongoose.Types.ObjectId(examineeId),
      senderName: senderMeta?.senderName || "",
      senderEmail: senderMeta?.senderEmail || "",
      senderPhone: senderMeta?.senderPhone || "",
      source: "user-chat",
    });

    return res.status(201).json({ success: true, message: "Message created", data: msg });
  } catch (err) {
    console.error("Error creating message:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const msgs = await populateMessage(Message.find().sort({ createdAt: -1 }));
    return res.json({ success: true, message: msgs });
  } catch (err) {
    console.error("Error fetching all messages:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    if (req.userRole !== "admin" && req.userId !== req.params.id) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const msgs = await populateMessage(
      Message.find({ examineeId: req.params.id, source: "user-chat" }).sort({ createdAt: -1 })
    );

    return res.json({ success: true, message: msgs });
  } catch (err) {
    console.error("Error fetching user messages:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/edit/:id", authMiddleware, async (req, res) => {
  try {
    const { question, role, userId } = req.body;
    const msg = await Message.findById(req.params.id);

    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    if (role !== "user" || msg.examineeId?.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not allowed to edit this message" });
    }

    msg.question = String(question || "").trim();
    msg.editedBy = "user";
    await msg.save();

    return res.json({ success: true, message: "Message updated", data: msg });
  } catch (err) {
    console.error("Error editing message:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/reply/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { answer, role } = req.body;

    if (role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can reply" });
    }

    const updated = await populateMessage(
      Message.findByIdAndUpdate(
        req.params.id,
        { answer: String(answer || "").trim(), editedBy: "admin" },
        { new: true }
      )
    );

    if (!updated) return res.status(404).json({ success: false, message: "Message not found" });

    return res.json({ success: true, message: "Reply saved", data: updated });
  } catch (err) {
    console.error("Error saving reply:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const { role, userId } = req.body;
    const msg = await Message.findById(req.params.id);

    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    if (role === "user") {
      if (msg.examineeId?.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Not allowed to delete this message" });
      }
      msg.question = "Message deleted by User";
      msg.deletedBy = "user";
    } else if (role === "admin") {
      msg.answer = "Reply deleted by Admin";
      msg.deletedBy = "admin";
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    await msg.save();
    return res.json({ success: true, message: "Message marked deleted", data: msg });
  } catch (err) {
    console.error("Error soft-deleting message:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
