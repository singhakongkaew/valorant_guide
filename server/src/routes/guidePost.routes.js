const express = require("express");
const c = require("../controllers/guidePost.controller");
const { authenticate, optionalAuthenticate, requireAdmin } = require("../middlewares/auth.middleware");
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 4 } }).array("images", 4);
const windows = new Map();
function limit(max, duration) { return (req, res, next) => { const now = Date.now(), key = `${req.user._id}:${req.route?.path || req.path}`, recent = (windows.get(key) || []).filter((time) => now - time < duration); if (recent.length >= max) return res.status(429).json({ message: "Too many requests. Please try again later." }); recent.push(now); windows.set(key, recent); next(); }; }
function parseUpload(req, res, next) { upload(req, res, (error) => error ? res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller." : "You can upload up to 4 images." }) : next()); }
router.get("/", c.list);
router.get("/mine", authenticate, c.mine);
router.get("/admin/pending", authenticate, requireAdmin, c.pending);
router.get("/:id", optionalAuthenticate, c.get);
router.post("/", authenticate, limit(5, 60 * 60 * 1000), parseUpload, c.create);
router.post("/:id/report", authenticate, limit(10, 60 * 60 * 1000), c.report);
router.put("/:id", authenticate, parseUpload, c.update);
router.delete("/:id", authenticate, c.remove);
router.patch("/:id/status", authenticate, requireAdmin, c.status);
module.exports = router;
