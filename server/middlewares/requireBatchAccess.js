const Payment = require("../models/Payment");
const Content = require("../models/Content");
const Batch = require("../models/Batch");

/**
 * SECURITY FIX: Verify user has access to content via batch purchase
 * This middleware checks:
 * 1. Content belongs to a batch
 * 2. User has purchased/has access to that batch
 */
const requireBatchAccess = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const contentId = req.params.id;
    const batchId = req.params.batchId;

    let batch;
    let content;

    // If contentId provided: get batch from content
    if (contentId) {
      content = await Content.findById(contentId).populate("batchId");
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      batch = content.batchId;
    } else if (batchId) {
      batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }
    }

    if (!batch) {
      return res.status(400).json({ error: "Invalid batch reference" });
    }

    // Check if batch creator
    if (batch.createdBy && batch.createdBy.toString() === userId.toString()) {
      return next();
    }

    // Check if user has successful payment for this batch
    const payment = await Payment.findOne({
      user: userId,
      batch: batch._id,
      paymentStatus: "success",
    });

    if (payment) {
      return next();
    }

    // Check if batch is free (no payment required)
    if (batch.isFree || batch.price === 0) {
      return next();
    }

    // No access
    return res.status(403).json({
      error: "You don't have access to this batch. Please purchase first.",
    });
  } catch (err) {
    console.error("Batch access verification error:", err);
    res.status(500).json({ error: "Access verification failed" });
  }
};

module.exports = requireBatchAccess;
