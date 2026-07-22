const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

const config = require("./config/env");
const logger = require("./utils/logger");
const { apiLimiter, authLimiter } = require("./config/rateLimiters");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const clientRoutes = require("./routes/client.routes");
const projectRoutes = require("./routes/project.routes");
const { nestedRouter: projectTaskRoutes, topRouter: taskRoutes } = require("./routes/task.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const communicationRoutes = require("./routes/communication.routes");
const notificationRoutes = require("./routes/notification.routes");
const rewardRoutes = require("./routes/reward.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize()); 

app.use(
  morgan(config.env === "production" ? "combined" : "dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

app.get("/health", (req, res) => res.status(200).json({ status: "ok", uptime: process.uptime() }));

const base = "/api";

app.use(base, apiLimiter);
app.use(`${base}/auth/login`, authLimiter);

app.use(`${base}/auth`, authRoutes);
app.use(`${base}/users`, userRoutes);
app.use(`${base}/clients`, clientRoutes);
app.use(`${base}/projects`, projectRoutes);
app.use(`${base}/projects/:projectId/tasks`, projectTaskRoutes);
app.use(`${base}/tasks`, taskRoutes);
app.use(`${base}/attendance`, attendanceRoutes);
app.use(`${base}/leave`, leaveRoutes);
app.use(`${base}/conversations`, communicationRoutes);
app.use(`${base}/notifications`, notificationRoutes);
app.use(`${base}/rewards`, rewardRoutes);
app.use(`${base}/dashboard`, dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

module.exports = app;
