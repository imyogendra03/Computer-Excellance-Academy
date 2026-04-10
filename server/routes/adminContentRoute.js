const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
  createContent,
  getBatchMeta,
  updateContent,
  deleteContent,
} = require("../controllers/contentController");

const router = express.Router();
const thumbnailUploadDir = path.join("uploads", "content-thumbnails");
if (!fs.existsSync(thumbnailUploadDir)) {
  fs.mkdirSync(thumbnailUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, thumbnailUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `thumb-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || ".jpg"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image thumbnails are allowed."));
    }
    return cb(null, true);
  },
});

const attachThumbnailPath = (req, res, next) => {
  if (req.file?.filename) {
    req.body.thumbnailUploadedPath = `/uploads/content-thumbnails/${req.file.filename}`;
  }
  next();
};

router.post(
  "/content",
  authMiddleware,
  adminMiddleware,
  upload.single("thumbnailFile"),
  attachThumbnailPath,
  createContent
);
router.get("/content/meta/:batchId", authMiddleware, adminMiddleware, getBatchMeta);
router.put(
  "/content/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("thumbnailFile"),
  attachThumbnailPath,
  updateContent
);
router.delete("/content/:id", authMiddleware, adminMiddleware, deleteContent);

module.exports = router;
