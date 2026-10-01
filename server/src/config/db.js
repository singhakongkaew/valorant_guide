const mongoose = require("mongoose");
const connectDB = async () => {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured.");
    if (mongoose.connection.readyState === 1) return;
    if (!global.mongoConnection) global.mongoConnection = mongoose.connect(process.env.MONGO_URI);
    try { await global.mongoConnection; }
    catch (error) { global.mongoConnection = null; throw error; }
};
module.exports = connectDB;
