require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET is too short for production (use 32+ random chars).");
  process.exit(1);
}

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  useCookieAuth: process.env.USE_COOKIE_AUTH === "true",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 300,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  },
};
