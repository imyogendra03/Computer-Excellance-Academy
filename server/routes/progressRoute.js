const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateProgress,
  getUserProgress,
} = require("../controllers/progressController");

const router = express.Router();

router.post("/update", authMiddleware, updateProgress);
router.get("/user/:userId", authMiddleware, getUserProgress);

module.exports = router;
