const User = require("../models/user.model");
const { publicUser } = require("./auth.controller");

async function listUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  } catch (error) { next(error); }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, role, isActive } = req.body;
    const changes = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) return res.status(400).json({ message: "ชื่อต้องมี 2–80 ตัวอักษร" });
      changes.name = name.trim();
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
      changes.email = email.trim().toLowerCase();
    }
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: "role ไม่ถูกต้อง" });
      if (String(req.user._id) === req.params.id && role !== "admin") return res.status(400).json({ message: "ไม่สามารถลดสิทธิ์ของบัญชีที่กำลังใช้งานได้" });
      changes.role = role;
    }
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") return res.status(400).json({ message: "isActive ต้องเป็น true หรือ false" });
      if (String(req.user._id) === req.params.id && !isActive) return res.status(400).json({ message: "ไม่สามารถปิดใช้งานบัญชีที่กำลังใช้งานได้" });
      changes.isActive = isActive;
    }
    const user = await User.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    res.json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    next(error);
  }
}

module.exports = { listUsers, updateUser };
