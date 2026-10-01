const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/user.model");
const { register, login } = require("../src/controllers/auth.controller");
const { readToken } = require("../src/utils/auth");

const secret = "auth-api-test-secret-that-is-long-enough";
const response = () => ({ statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test("registration creates a user role and returns a signed session", async () => {
  const old = { findOne: User.findOne, create: User.create, secret: process.env.JWT_SECRET, admin: process.env.ADMIN_EMAIL };
  process.env.JWT_SECRET = secret;
  process.env.ADMIN_EMAIL = "owner@example.com";
  User.findOne = async () => null;
  User.create = async (user) => ({ ...user, _id: "new-user", isActive: true, createdAt: new Date("2026-01-01") });
  try {
    const res = response();
    await register({ body: { name: "Regular User", email: "user@example.com", password: "verysecurepassword" } }, res, (error) => { throw error; });
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.user.role, "user");
    assert.equal(res.body.user.passwordHash, undefined);
    assert.equal(readToken(res.body.token, secret).sub, "new-user");
  } finally {
    User.findOne = old.findOne; User.create = old.create;
    if (old.secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = old.secret;
    if (old.admin === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = old.admin;
  }
});

test("configured admin email receives the administrator role at registration", async () => {
  const old = { findOne: User.findOne, create: User.create, secret: process.env.JWT_SECRET, admin: process.env.ADMIN_EMAIL };
  process.env.JWT_SECRET = secret;
  process.env.ADMIN_EMAIL = "owner@example.com";
  let created;
  User.findOne = async () => null;
  User.create = async (user) => { created = user; return { ...user, _id: "admin-user", isActive: true }; };
  try {
    const res = response();
    await register({ body: { name: "Owner User", email: "OWNER@example.com", password: "verysecurepassword" } }, res, (error) => { throw error; });
    assert.equal(created.role, "admin");
    assert.equal(res.body.user.role, "admin");
  } finally {
    User.findOne = old.findOne; User.create = old.create;
    if (old.secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = old.secret;
    if (old.admin === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = old.admin;
  }
});

test("login rejects invalid credentials and accepts a valid password", async () => {
  const { hashPassword } = require("../src/utils/auth");
  const old = { findOne: User.findOne, secret: process.env.JWT_SECRET };
  process.env.JWT_SECRET = secret;
  const user = { _id: "login-user", name: "Login User", email: "login@example.com", role: "user", isActive: true, passwordHash: await hashPassword("verysecurepassword") };
  User.findOne = () => ({ select: async () => user });
  try {
    const invalid = response();
    await login({ body: { email: user.email, password: "incorrect-password" } }, invalid, (error) => { throw error; });
    assert.equal(invalid.statusCode, 401);
    const valid = response();
    await login({ body: { email: user.email, password: "verysecurepassword" } }, valid, (error) => { throw error; });
    assert.equal(valid.statusCode, 200);
    assert.equal(valid.body.user.id, user._id);
  } finally {
    User.findOne = old.findOne;
    if (old.secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = old.secret;
  }
});
