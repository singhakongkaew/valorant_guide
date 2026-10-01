const GuidePost = require("../models/guidePost.model");
const { AUTO_APPROVE } = require("../config/guides");
const crypto = require("node:crypto");
const cleanText = (value) => String(value || "").replace(/<[^>]*>/g, "").trim();
const videoId = (value) => {
  if (!value) return "";
  let url; try { url = new URL(value); } catch { throw Object.assign(new Error("Invalid YouTube URL"), { status: 400, fields: { videoYoutubeId: "Enter a valid YouTube link." } }); }
  if (!["http:", "https:"].includes(url.protocol) || !["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"].includes(url.hostname)) throw Object.assign(new Error("Invalid YouTube URL"), { status: 400, fields: { videoYoutubeId: "Only YouTube links are accepted." } });
  let id = "";
  if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") id = url.pathname.slice(1);
  else if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
  else if (/^\/shorts\/[A-Za-z0-9_-]{11}\/?$/.test(url.pathname)) id = url.pathname.split("/")[2];
  if (!/^[A-Za-z0-9_-]{11}$/.test(id || "")) throw Object.assign(new Error("Invalid YouTube URL"), { status: 400, fields: { videoYoutubeId: "This link does not contain a valid video ID." } });
  return id;
};
const publicFields = "title description category agent level patchVersion images videoYoutubeId author status rejectionReason reportCount createdAt updatedAt";
const payload = (body) => ({ title: cleanText(body.title), description: cleanText(body.description), category: body.category, agent: body.category === "agents" ? cleanText(body.agent) : "", level: body.level, patchVersion: cleanText(body.patchVersion), videoYoutubeId: videoId(body.videoYoutubeId), images: [] });
const cloudinaryConfig = () => ({ cloud: process.env.CLOUDINARY_CLOUD_NAME, key: process.env.CLOUDINARY_API_KEY, secret: process.env.CLOUDINARY_API_SECRET });
function cloudinarySignature(params, secret) { const base = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&"); return crypto.createHash("sha1").update(`${base}${secret}`).digest("hex"); }
async function uploadImage(file) {
  const { cloud, key, secret } = cloudinaryConfig();
  if (!cloud || !key || !secret) throw Object.assign(new Error("Image storage is not configured."), { status: 503 });
  const timestamp = Math.floor(Date.now() / 1000), publicId = `guide-posts/${crypto.randomUUID()}`;
  const params = { public_id: publicId, timestamp };
  const form = new FormData(); form.set("file", new Blob([file.buffer], { type: file.mimetype })); form.set("api_key", key); form.set("timestamp", String(timestamp)); form.set("public_id", publicId); form.set("signature", cloudinarySignature(params, secret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || "Image upload failed.");
  return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height };
}
async function deleteImages(images = []) {
  const { cloud, key, secret } = cloudinaryConfig(); if (!cloud || !key || !secret) return;
  await Promise.allSettled(images.filter((image) => image.publicId).map(async (image) => {
    const timestamp = Math.floor(Date.now() / 1000), params = { public_id: image.publicId, timestamp };
    const form = new FormData(); form.set("public_id", image.publicId); form.set("api_key", key); form.set("timestamp", String(timestamp)); form.set("signature", cloudinarySignature(params, secret));
    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", body: form });
  }));
}
function validate(data, agreed) {
  const errors = {};
  if (data.title.length < 5 || data.title.length > 100) errors.title = "Title must be 5 to 100 characters.";
  if (data.description.length < 20 || data.description.length > 2000) errors.description = "Description must be 20 to 2000 characters.";
  if (!["gunplay", "movement", "agents", "other"].includes(data.category)) errors.category = "Choose a valid category.";
  if (!["beginner", "intermediate", "advanced"].includes(data.level)) errors.level = "Choose a valid level.";
  if (data.patchVersion.length > 10) errors.patchVersion = "Patch version must be 10 characters or fewer.";
  if (data.category === "agents" && !data.agent) errors.agent = "Choose an agent.";
  if (!agreed) errors.agreed = "Please confirm you have permission to share this content.";
  return errors;
}
exports.list = async (req, res, next) => { try {
  const query = { status: "approved" };
  if (req.query.category && !["gunplay", "movement", "agents", "other"].includes(req.query.category)) return res.status(400).json({ message: "Invalid category filter.", fields: { category: "Choose a valid category." } });
  if (req.query.level && !["beginner", "intermediate", "advanced"].includes(req.query.level)) return res.status(400).json({ message: "Invalid level filter.", fields: { level: "Choose a valid level." } });
  for (const field of ["category", "level"]) if (req.query[field]) query[field] = req.query[field];
  if (req.query.agent) query.agent = cleanText(req.query.agent).slice(0, 40);
  if (req.query.q) query.$text = { $search: String(req.query.q).slice(0, 100) };
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(20, Math.max(1, Number(req.query.limit) || 12));
  const [posts, total] = await Promise.all([GuidePost.find(query).select(publicFields).populate("author", "name").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), GuidePost.countDocuments(query)]);
  res.json({ posts, page, pages: Math.ceil(total / limit), total });
} catch (e) { next(e); } };
exports.get = async (req, res, next) => { try {
  const post = await GuidePost.findById(req.params.id).select(publicFields).populate("author", "name");
  if (!post) return res.status(404).json({ message: "Guide post not found." });
  const own = req.user && String(post.author._id) === String(req.user._id);
  if (post.status !== "approved" && !own && req.user?.role !== "admin") return res.status(404).json({ message: "Guide post not found." });
  res.json({ post: { ...post.toObject(), isMine: own || req.user?.role === "admin" } });
} catch (e) { next(e); } };
exports.mine = async (req, res, next) => { try { const posts = await GuidePost.find({ author: req.user._id }).select(publicFields).sort({ createdAt: -1 }); res.json({ posts }); } catch (e) { next(e); } };
exports.create = async (req, res, next) => { try {
  const data = payload(req.body), errors = validate(data, req.body.agreed === "true" || req.body.agreed === true);
  if ((req.files || []).length > 4) errors.images = "Choose up to 4 images.";
  for (const file of req.files || []) if (!validImage(file)) errors.images = "Only valid JPG, PNG, and WebP images up to 5 MB are accepted.";
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", fields: errors });
  data.images = await Promise.all((req.files || []).map(uploadImage));
  const post = await GuidePost.create({ ...data, author: req.user._id, status: AUTO_APPROVE ? "approved" : "pending" });
  res.status(201).json({ post, message: AUTO_APPROVE ? "Your post is live." : "Thanks! Your post is waiting for review." });
} catch (e) { next(e); } };
exports.update = async (req, res, next) => { try {
  const post = await GuidePost.findById(req.params.id); if (!post) return res.status(404).json({ message: "Guide post not found." });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only edit your own posts." });
  const data = payload(req.body), errors = validate(data, req.body.agreed === "true" || req.body.agreed === true);
  const existingCount = post.images.length, incoming = req.files || [];
  if (existingCount + incoming.length > 4) errors.images = "A post can have up to 4 images.";
  for (const file of incoming) if (!validImage(file)) errors.images = "Only valid JPG, PNG, and WebP images up to 5 MB are accepted.";
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", fields: errors });
  data.images = [...post.images, ...await Promise.all(incoming.map(uploadImage))];
  Object.assign(post, data, { status: AUTO_APPROVE ? "approved" : "pending" }); await post.save(); res.json({ post });
} catch (e) { next(e); } };
exports.remove = async (req, res, next) => { try { const post = await GuidePost.findById(req.params.id); if (!post) return res.status(404).json({ message: "Guide post not found." }); if (String(post.author) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "You cannot delete this post." }); await deleteImages(post.images); await post.deleteOne(); res.json({ message: "Post deleted." }); } catch (e) { next(e); } };
exports.report = async (req, res, next) => { try { const post = await GuidePost.findById(req.params.id); if (!post) return res.status(404).json({ message: "Guide post not found." }); if (post.reporters.some((id) => String(id) === String(req.user._id))) return res.status(409).json({ message: "You have already reported this post." }); post.reporters.push(req.user._id); post.reportCount = post.reporters.length; if (post.reportCount >= 3) post.status = "hidden"; await post.save(); res.json({ message: "Report received." }); } catch (e) { next(e); } };
exports.pending = async (_req, res, next) => { try { const posts = await GuidePost.find({ status: { $in: ["pending", "hidden"] } }).populate("author", "name").sort({ createdAt: 1 }); res.json({ posts }); } catch (e) { next(e); } };
exports.status = async (req, res, next) => { try { const { status, reason = "" } = req.body; if (!["approved", "rejected", "hidden"].includes(status) || (status === "rejected" && !cleanText(reason))) return res.status(400).json({ message: "Choose a valid status and provide a rejection reason." }); const post = await GuidePost.findByIdAndUpdate(req.params.id, { status, rejectionReason: status === "rejected" ? cleanText(reason).slice(0, 500) : "" }, { new: true }).populate("author", "name"); if (!post) return res.status(404).json({ message: "Guide post not found." }); res.json({ post }); } catch (e) { next(e); } };

function validImage(file) {
  const b = file.buffer;
  if (!b || b.length > 5 * 1024 * 1024) return false;
  return (file.mimetype === "image/jpeg" && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    || (file.mimetype === "image/png" && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    || (file.mimetype === "image/webp" && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP");
}
