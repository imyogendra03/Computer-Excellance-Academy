const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const requireBatchAccess = require("../middlewares/requireBatchAccess");
const {
  getContentByBatch,
  getContentById,
} = require("../controllers/contentController");

const router = express.Router();

// SECURITY FIX: Added requireBatchAccess to verify user has purchased the batch
router.get("/batch/:batchId", authMiddleware, requireBatchAccess, getContentByBatch);
router.get("/:id", authMiddleware, requireBatchAccess, getContentById);

module.exports = router;
