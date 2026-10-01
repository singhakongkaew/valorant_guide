const User = require("../models/user.model");
const { hashPassword, verifyPassword, createToken } = require("../utils/auth");

const publicUser = (user) => ({ id: String(user._id), name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt });

async function register(req, res, next) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (name.length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 8 ตัวให้ถูกต้อง" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: adminEmail && email === adminEmail ? "admin" : "user" });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !user.isActive || !(await verifyPassword(String(req.body.password || ""), user.passwordHash))) return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

function me(req, res) { res.json({ user: publicUser(req.user) }); }
module.exports = { register, login, me, publicUser };
