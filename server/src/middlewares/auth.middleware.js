const User = require("../models/user.model");
const { readToken } = require("../utils/auth");

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const payload = readToken(token);
  if (!payload) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบอีกครั้ง" });
  try {
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: "บัญชีนี้ไม่สามารถใช้งานได้" });
    req.user = user;
    next();
  } catch (error) { next(error); }
}

async function optionalAuthenticate(req, _res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const payload = readToken(token);
  if (!payload) return next();
  try {
    const user = await User.findById(payload.sub);
    if (user?.isActive) req.user = user;
    next();
  } catch (error) { next(error); }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "ต้องใช้สิทธิ์ผู้ดูแลระบบ" });
  next();
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin };
