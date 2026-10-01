const GuidePost = require("../models/guidePost.model");
const { AUTO_APPROVE } = require("../config/guides");
const { del } = require("@vercel/blob");
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
async function deleteImages(images = []) {
  await Promise.allSettled(images.filter((image) => image.url).map((image) => del(image.url)));
}
function imageRecords(images, userId) {
  if (!Array.isArray(images) || images.length > 4) throw Object.assign(new Error("Choose up to 4 images."), { status: 400, fields: { images: "Choose up to 4 images." } });
  return images.map((image) => {
    let url; try { url = new URL(image.url); } catch { throw Object.assign(new Error("Invalid image URL."), { status: 400, fields: { images: "Upload images directly to Vercel Blob." } }); }
    if (url.protocol !== "https:" || !url.hostname.endsWith(".blob.vercel-storage.com") || !url.pathname.startsWith(`/guide-posts/${userId}/`)) throw Object.assign(new Error("Image must belong to your Vercel Blob upload."), { status: 400, fields: { images: "Upload images directly to Vercel Blob." } });
    return { url: url.href, publicId: url.pathname.slice(1), width: Number(image.width) || 0, height: Number(image.height) || 0 };
  });
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
  try { data.images = imageRecords(req.body.images || [], req.user._id); } catch (e) { errors.images = e.fields?.images || e.message; }
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", fields: errors });
  const post = await GuidePost.create({ ...data, author: req.user._id, status: AUTO_APPROVE ? "approved" : "pending" });
  res.status(201).json({ post, message: AUTO_APPROVE ? "Your post is live." : "Thanks! Your post is waiting for review." });
} catch (e) { next(e); } };
exports.update = async (req, res, next) => { try {
  const post = await GuidePost.findById(req.params.id); if (!post) return res.status(404).json({ message: "Guide post not found." });
  if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only edit your own posts." });
  const data = payload(req.body), errors = validate(data, req.body.agreed === "true" || req.body.agreed === true);
  try { data.images = imageRecords(req.body.images || [], req.user._id); } catch (e) { errors.images = e.fields?.images || e.message; }
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields.", fields: errors });
  const removed = post.images.filter((oldImage) => !data.images.some((image) => image.url === oldImage.url));
  Object.assign(post, data, { status: AUTO_APPROVE ? "approved" : "pending" }); await post.save(); await deleteImages(removed); res.json({ post });
} catch (e) { next(e); } };
exports.remove = async (req, res, next) => { try { const post = await GuidePost.findById(req.params.id); if (!post) return res.status(404).json({ message: "Guide post not found." }); if (String(post.author) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "You cannot delete this post." }); await deleteImages(post.images); await post.deleteOne(); res.json({ message: "Post deleted." }); } catch (e) { next(e); } };
exports.report = async (req, res, next) => { try { const post = await GuidePost.findById(req.params.id); if (!post) return res.status(404).json({ message: "Guide post not found." }); if (post.reporters.some((id) => String(id) === String(req.user._id))) return res.status(409).json({ message: "You have already reported this post." }); post.reporters.push(req.user._id); post.reportCount = post.reporters.length; if (post.reportCount >= 3) post.status = "hidden"; await post.save(); res.json({ message: "Report received." }); } catch (e) { next(e); } };
exports.pending = async (_req, res, next) => { try { const posts = await GuidePost.find({ status: { $in: ["pending", "hidden"] } }).populate("author", "name").sort({ createdAt: 1 }); res.json({ posts }); } catch (e) { next(e); } };
exports.status = async (req, res, next) => { try { const { status, reason = "" } = req.body; if (!["approved", "rejected", "hidden"].includes(status) || (status === "rejected" && !cleanText(reason))) return res.status(400).json({ message: "Choose a valid status and provide a rejection reason." }); const post = await GuidePost.findByIdAndUpdate(req.params.id, { status, rejectionReason: status === "rejected" ? cleanText(reason).slice(0, 500) : "" }, { new: true }).populate("author", "name"); if (!post) return res.status(404).json({ message: "Guide post not found." }); res.json({ post }); } catch (e) { next(e); } };
