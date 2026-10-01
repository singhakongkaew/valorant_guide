const express = require("express");
const { listUsers, updateUser } = require("../controllers/admin.controller");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");
const router = express.Router();
router.use(authenticate, requireAdmin);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
module.exports = router;
