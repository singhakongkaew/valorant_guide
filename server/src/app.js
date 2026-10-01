const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const guidePostRoutes = require("./routes/guidePost.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const connectDB = require("./config/db");
const app = express();

// 1. Global middleware
app.use(cors());
app.use(express.json());
app.use(async (_req, _res, next) => { try { await connectDB(); next(); } catch (error) { next(error); } });

// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tracks", trackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/guides", guidePostRoutes);

// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
