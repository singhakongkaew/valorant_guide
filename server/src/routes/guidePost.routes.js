const express = require("express");
const c = require("../controllers/guidePost.controller");
const { authenticate, optionalAuthenticate, requireAdmin } = require("../middlewares/auth.middleware");
const { handleUpload } = require("@vercel/blob/client");
const router = express.Router();
const windows = new Map();
function limit(max, duration) { return (req, res, next) => { const now = Date.now(), key = `${req.user._id}:${req.route?.path || req.path}`, recent = (windows.get(key) || []).filter((time) => now - time < duration); if (recent.length >= max) return res.status(429).json({ message: "Too many requests. Please try again later." }); recent.push(now); windows.set(key, recent); next(); }; }
router.get("/", c.list);
router.get("/mine", authenticate, c.mine);
router.get("/admin/pending", authenticate, requireAdmin, c.pending);
router.get("/:id", optionalAuthenticate, c.get);
router.post("/upload-token", (req, res, next) => {
  if (req.body?.type === "blob.generate-client-token") {
    if (typeof req.body.clientPayload !== "string") return res.status(401).json({ message: "Sign in before uploading images." });
    req.headers.authorization = `Bearer ${req.body.clientPayload}`;
    return authenticate(req, res, next);
  }
  next();
}, async (req, res, next) => {
  try {
    const json = await handleUpload({ body: req.body, request: req, onBeforeGenerateToken: async (_pathname, clientPayload) => {
      if (!_pathname.startsWith(`guide-posts/${req.user._id}/`)) throw new Error("Invalid upload owner or path.");
      return { allowedContentTypes: ["image/jpeg", "image/png", "image/webp"], maximumSizeInBytes: 5 * 1024 * 1024, addRandomSuffix: false, tokenPayload: clientPayload };
    }, onUploadCompleted: async () => {} });
    res.json(json);
  } catch (error) { next(error); }
});
router.post("/", authenticate, limit(5, 60 * 60 * 1000), c.create);
router.post("/:id/report", authenticate, limit(10, 60 * 60 * 1000), c.report);
router.put("/:id", authenticate, c.update);
router.delete("/:id", authenticate, c.remove);
router.patch("/:id/status", authenticate, requireAdmin, c.status);
module.exports = router;
