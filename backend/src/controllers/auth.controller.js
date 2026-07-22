const authService = require("../services/auth.service");
const { sanitizeUser } = require("../utils/apiResponse");

const USE_COOKIE_AUTH = process.env.USE_COOKIE_AUTH === "true";

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const { token, user } = await authService.login(email, password);

    if (USE_COOKIE_AUTH) setAuthCookie(res, token);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    if (err instanceof authService.InvalidCredentialsError) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    if (USE_COOKIE_AUTH) res.clearCookie("token");
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const user = await authService.getById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: sanitizeUser(user, req.user.role) });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, me };
