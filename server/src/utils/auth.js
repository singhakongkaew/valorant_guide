const crypto = require("node:crypto");
const promisify = require("node:util").promisify;
const pbkdf2 = promisify(crypto.pbkdf2);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await pbkdf2(password, salt, 210000, 32, "sha256");
  return `pbkdf2$210000$${salt}$${hash.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [scheme, rounds, salt, expected] = String(stored || "").split("$");
  if (scheme !== "pbkdf2" || !/^\d+$/.test(rounds) || !salt || !expected) return false;
  const actual = await pbkdf2(password, salt, Number(rounds), 32, "sha256");
  const target = Buffer.from(expected, "hex");
  return actual.length === target.length && crypto.timingSafeEqual(actual, target);
}

function createToken(user, secret = process.env.JWT_SECRET, now = Math.floor(Date.now() / 1000)) {
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: String(user._id), role: user.role, iat: now, exp: now + 60 * 60 * 12 })}`;
  return `${body}.${crypto.createHmac("sha256", secret).update(body).digest("base64url")}`;
}

function readToken(token, secret = process.env.JWT_SECRET, now = Math.floor(Date.now() / 1000)) {
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest();
  let received;
  try { received = Buffer.from(parts[2], "base64url"); } catch { return null; }
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (header.alg !== "HS256" || typeof payload.sub !== "string" || payload.exp <= now) return null;
    return payload;
  } catch { return null; }
}

module.exports = { hashPassword, verifyPassword, createToken, readToken };
