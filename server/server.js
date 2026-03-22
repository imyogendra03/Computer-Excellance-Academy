require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// CORS Configuration - Restrict to frontend domain
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

let dbConnected = false;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    dbConnected = true;
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    dbConnected = false;
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// Middleware to check database connection before requests
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

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

// Health Check Routes
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

// Auth Routes
app.use("/api/auth", require("./routes/auth"));

// Admin Routes
app.use("/api/admin", require("./routes/adminRoute"));

// User/Examinee Routes
app.use("/api/examinee", require("./routes/examineeRoute"));

// Course Routes
app.use("/api/course", require("./routes/courseRoute"));

// Batch Routes
app.use("/api/batch", require("./routes/batchRoute"));

// Payment Routes
app.use("/api/payment", require("./routes/paymentRoute"));

// Dashboard Routes
app.use("/api/dashboard", require("./routes/dashboardRoute"));

// Note Routes (unified endpoint)
app.use("/api/notes", require("./routes/noteRoute"));
app.use("/api/note", require("./routes/noteRoute")); // Backward compatibility

// Subject Routes
app.use("/api/subject", require("./routes/subjectRoute"));

// Session Routes
app.use("/api/session", require("./routes/sessionRoute"));

// Question Routes
app.use("/api/question", require("./routes/questionRoute"));

// Examination Routes
app.use("/api/exams", require("./routes/examinationRoute"));
app.use("/api/examination", require("./routes/examinationRoute")); // Backward compatibility

// Message Routes
app.use("/api/message", require("./routes/messageRoute"));

// ============================================================================
// PROTECTED ROUTES EXAMPLE
// ============================================================================

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

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// ============================================================================
// SERVER START
// ============================================================================

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

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;