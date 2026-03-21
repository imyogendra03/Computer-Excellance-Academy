require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoute"));

// Payment routes
app.use("/api/payment", require("./routes/paymentRoute"));

// Course routes
app.use("/api/course", require("./routes/courseRoute"));

// Batch routes
app.use("/api/batch", require("./routes/batchRoute"));

// Examinee routes
app.use("/api/examinee", require("./routes/examineeRoute"));

// Dashboard routes
app.use("/api/dashboard", require("./routes/dashboardRoute"));

// Note routes
app.use("/api/note", require("./routes/noteRoute"));

// Subject routes
app.use("/api/subject", require("./routes/subjectRoute"));

// Session routes
app.use("/api/session", require("./routes/sessionRoute"));

// Question routes
app.use("/api/question", require("./routes/questionRoute"));

// Examination routes
app.use("/api/examination", require("./routes/examinationRoute"));

// Message routes
app.use("/api/message", require("./routes/messageRoute"));

// Protected route
const { verifyToken } = require("./middlewares/authMiddleware");
app.get("/api/profile", verifyToken, async (req, res) => {
  const Examinee = require("./models/Examinee");
  const user = await Examinee.findById(req.user.id).select("-password -refreshToken");
  res.json(user);
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
);