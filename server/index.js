const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const sanitizeRequest = require("./middlewares/sanitizeRequest");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "12mb" }));
app.use(sanitizeRequest());
app.use("/uploads", express.static("uploads"));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.warn("⚠️  MONGO_URI not set. Server running without database connection.");
} else {
  const connectDB = async () => {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      console.log("✅ MongoDB Connected");
    } catch (err) {
      console.error("❌ MongoDB connection failed:", err.message);
      // Retry after 5 seconds
      setTimeout(connectDB, 5000);
    }
  };

  connectDB();

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected. Reconnecting...");
    setTimeout(connectDB, 5000);
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB error:", err.message);
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected");
  });
}


// PRIORITY ROUTES for Curriculum Management
app.use("/api/subject", require("./routes/subjectRoute"));
app.use("/api/chapter", require("./routes/chapterRoute"));
app.use("/api/admin/subject", require("./routes/subjectRoute"));
app.use("/api/admin/chapter", require("./routes/chapterRoute"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/noteRoute"));
app.use("/api/notes", require("./routes/userNotesRoute"));
app.use("/api/examinee", require("./routes/examineeRoute"));
app.use("/api/admin", require("./routes/adminRoute"));
app.use("/api/admin", require("./routes/adminContentRoute"));
app.use("/api/session", require("./routes/sessionRoute"));
app.use("/api/question", require("./routes/questionRoute"));
app.use("/api/exams", require("./routes/examinationRoute"));
app.use("/api/message", require("./routes/messageRoute"));
app.use("/api/assistant", require("./routes/assistantRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));

app.use("/api/course", require("./routes/courseRoute"));
app.use("/api/batch", require("./routes/batchRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));
app.use("/api/attendance", require("./routes/attendanceRoute"));
app.use("/api/coupon", require("./routes/couponRoute"));
app.use("/api/review", require("./routes/reviewRoute"));
app.use("/api/leaderboard", require("./routes/leaderboardRoute"));
app.use("/api/content", require("./routes/contentRoute"));
app.use("/api/progress", require("./routes/progressRoute"));
app.use("/api/user", require("./routes/userContentRoute"));

app.get("/api/test-db", async (req, res) => {
  try {
    const Admin = require("./models/Admin");
    const count = await Admin.countDocuments();
    return res.json({ success: true, count, message: "DB connected" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => {
  return res.json({ success: true, message: "CEA Backend running" });
});



app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url} - Request not handled by any route`);
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  res.status(status).json({ success: false, message: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ CEA Server running on port ${PORT}`);
});
