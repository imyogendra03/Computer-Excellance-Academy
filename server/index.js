require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Atlas MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully Connected"))
  .catch((er) => console.log(`Error is ${er}`));

// Auth routes
app.use("/api/auth", require("./routes/auth"));

// Existing APIs
app.use("/api/notes", require("./routes/noteRoute"));
app.use("/api/examinee", require("./routes/examineeRoute"));
app.use("/api/admin", require("./routes/adminRoute"));
app.use("/api/session", require("./routes/sessionRoute"));
app.use("/api/subject", require("./routes/subjectRoute"));
app.use("/api/question", require("./routes/questionRoute"));
app.use("/api/exams", require("./routes/examinationRoute"));
app.use("/api/message", require("./routes/messageRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));

// Course, Batch, Payment
app.use("/api/course", require("./routes/courseRoute"));
app.use("/api/batch", require("./routes/batchRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "ExamPrep backend is running successfully",
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Connected on http://localhost:5000");
});