const http = require("http");
const mongoose = require("mongoose");
const config = require("./src/config/env");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const initSocket = require("./src/config/socket");
const logger = require("./src/utils/logger");

async function start() {
  await connectDB();

  const server = http.createServer(app);
  const io = initSocket(server, config.corsOrigins.length ? config.corsOrigins : "*");
  app.set("io", io); 

  server.listen(config.port, () => {
    logger.info(`TeamFlow backend listening on port ${config.port} [${config.env}]`);
  });

  const shutdown = (signal) => async () => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      io.close();
      await mongoose.connection.close();
      logger.info("Shutdown complete");
      process.exit(0);
    });
    
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", shutdown("SIGTERM"));
  process.on("SIGINT", shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.stack || err}`);
    process.exit(1);
  });
}

start();
