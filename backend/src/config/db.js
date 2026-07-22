const mongoose = require("mongoose");
const config = require("./env");
const logger = require("../utils/logger");

async function connectDB() {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });
  mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 20,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB initial connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
