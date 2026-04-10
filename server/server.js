require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const sanitizeRequest = require("./middlewares/sanitizeRequest");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(sanitizeRequest());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

let dbConnected = false;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    dbConnected = true;
  })
  .catch((err) => {
    dbConnected = false;
    console.error("❌ MongoDB Connection Error:", err.message);
  });

const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database connection lost. Please try again later.",
      state: mongoose.connection.readyState
    });
  }
  next();
};

app.use(checkDBConnection);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "🚀 ExamPrep Backend is running successfully",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  return res.json({
    success: true,
    message: "Server is healthy",
    dbConnected,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const Admin = require("./models/Admin");
    const adminCount = await Admin.countDocuments();
    const Examinee = require("./models/Examinee");
    const examineeCount = await Examinee.countDocuments();

    return res.json({
      success: true,
      message: "Database is connected and working",
      stats: {
        admins: adminCount,
        examinees: examineeCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.use("/api/auth", require("./routes/auth"));

app.use("/api/admin", require("./routes/adminRoute"));
app.use("/api/admin", require("./routes/adminContentRoute"));
app.use("/api/admin/subject", require("./routes/subjectRoute"));
app.use("/api/admin/chapter", require("./routes/chapterRoute"));

app.use("/api/examinee", require("./routes/examineeRoute"));

app.use("/api/course", require("./routes/courseRoute"));

app.use("/api/batch", require("./routes/batchRoute"));

app.use("/api/payment", require("./routes/paymentRoute"));

app.use("/api/dashboard", require("./routes/dashboardRoute"));

app.use("/api/notes", require("./routes/noteRoute"));
app.use("/api/note", require("./routes/noteRoute")); // Backward compatibility

app.use("/api/subject", require("./routes/subjectRoute"));
app.use("/api/chapter", require("./routes/chapterRoute"));

app.use("/api/session", require("./routes/sessionRoute"));

app.use("/api/question", require("./routes/questionRoute"));

app.use("/api/exams", require("./routes/examinationRoute"));
app.use("/api/examination", require("./routes/examinationRoute")); // Backward compatibility

app.use("/api/message", require("./routes/messageRoute"));
app.use("/api/content", require("./routes/contentRoute"));
app.use("/api/progress", require("./routes/progressRoute"));
app.use("/api/user", require("./routes/userContentRoute"));

const { verifyToken } = require("./middlewares/authMiddleware");

app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const Examinee = require("./models/Examinee");
    const user = await Examinee.findById(req.user.id).select("-password -refreshToken");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🚀 ExamPrep Server Running Successfully 🚀         ║
║                                                            ║
║        Server: http://localhost:${PORT}                    ║
║        Status: READY TO ACCEPT REQUESTS                   ║
║        Environment: ${process.env.NODE_ENV || "development"}                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

process.on("SIGTERM", () => {
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
