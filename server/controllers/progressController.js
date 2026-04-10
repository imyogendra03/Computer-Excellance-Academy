const Progress = require("../models/Progress");
const Content = require("../models/Content");
const { hasActiveBatchAccess } = require("../utils/learningAccess");

const updateProgress = async (req, res, next) => {
  try {
    const { contentId, watchedTime = 0, completed = false } = req.body || {};

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: "contentId is required.",
      });
    }

    const content = await Content.findById(contentId).select("batchId");
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found." });
    }

    if (req.userRole !== "admin") {
      const hasAccess = await hasActiveBatchAccess(req.userId, content.batchId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this content.",
        });
      }
    }

    const existing = await Progress.findOne({
      userId: req.userId,
      contentId,
    });

    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId, contentId },
      {
        $set: {
          completed: Boolean(completed),
          lastAccessed: new Date(),
        },
        $max: {
          watchedTime: Math.max(Number(watchedTime) || 0, existing?.watchedTime || 0),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

const getUserProgress = async (req, res, next) => {
  try {
    const requestedUserId = req.params.userId;
    if (req.userRole !== "admin" && String(req.userId) !== String(requestedUserId)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own progress.",
      });
    }

    const data = await Progress.find({ userId: requestedUserId })
      .sort({ lastAccessed: -1 })
      .populate({
        path: "contentId",
        populate: [
          { path: "batchId", select: "batchName" },
          { path: "subjectId", select: "title subjectname" },
          { path: "chapterId", select: "title" },
        ],
      })
      .lean();

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProgress,
  getUserProgress,
};
