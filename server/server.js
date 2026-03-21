require("dotenv").config();
const express   = require("express");
const mongoose  = require("mongoose");
const app       = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.use("/api/auth", require("./routes/auth"));

// Protected route example
const { verifyToken } = require("./middlewares/authMiddleware");
app.get("/api/profile", verifyToken, async (req, res) => {
  const Examinee = require("./models/Examinee");
  const user = await Examinee.findById(req.user.id).select("-password -refreshToken");
  res.json(user);
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);