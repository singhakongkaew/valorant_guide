const mongoose = require("mongoose");
const guidePostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  description: { type: String, required: true, minlength: 20, maxlength: 2000 },
  category: { type: String, enum: ["gunplay", "movement", "agents", "other"], required: true },
  agent: { type: String, trim: true, maxlength: 40 },
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
  patchVersion: { type: String, trim: true, maxlength: 10 },
  images: [{ url: String, publicId: String, width: Number, height: Number }],
  videoYoutubeId: { type: String, default: "" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "hidden"], default: "pending" },
  rejectionReason: { type: String, maxlength: 500, default: "" },
  reportCount: { type: Number, default: 0 },
  reporters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
guidePostSchema.index({ status: 1, createdAt: -1 });
guidePostSchema.index({ title: "text", description: "text" });
module.exports = mongoose.models.GuidePost || mongoose.model("GuidePost", guidePostSchema);
