const rateLimit = require("express-rate-limit");
const config = require("./env");

const isDev = config.env !== "production";

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isDev ? 50000 : config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

//Rate limiter for Auth
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: isDev ? 1000 : config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

module.exports = { apiLimiter, authLimiter };
