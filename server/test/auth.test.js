const test = require("node:test");
const assert = require("node:assert/strict");
const { hashPassword, verifyPassword, createToken, readToken } = require("../src/utils/auth");
const { requireAdmin } = require("../src/middlewares/auth.middleware");

const secret = "test-only-secret-with-at-least-32-characters";

test("password hashes are salted and verify only the matching password", async () => {
  const first = await hashPassword("correct horse battery");
  const second = await hashPassword("correct horse battery");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("correct horse battery", first), true);
  assert.equal(await verifyPassword("wrong password", first), false);
});

test("signed tokens contain identity and reject expiration or tampering", () => {
  const token = createToken({ _id: "user-123", role: "admin" }, secret, 1000);
  assert.deepEqual(readToken(token, secret, 1001), { sub: "user-123", role: "admin", iat: 1000, exp: 44200 });
  assert.equal(readToken(token, secret, 44200), null);
  assert.equal(readToken(`${token.slice(0, -1)}x`, secret, 1001), null);
  assert.equal(readToken(token, "a-different-secret-with-at-least-32-characters", 1001), null);
});

test("token creation refuses weak server secrets", () => {
  assert.throws(() => createToken({ _id: "1", role: "user" }, "weak"), /at least 32/);
});

test("admin guard allows administrators and rejects regular users", () => {
  const response = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  let nextCalls = 0;
  requireAdmin({ user: { role: "user" } }, response, () => { nextCalls += 1; });
  assert.equal(response.statusCode, 403);
  requireAdmin({ user: { role: "admin" } }, response, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
});
