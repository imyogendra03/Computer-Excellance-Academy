const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getRecentlyViewed } = require("../controllers/contentController");

const router = express.Router();

router.get("/recently-viewed", authMiddleware, getRecentlyViewed);

module.exports = router;
