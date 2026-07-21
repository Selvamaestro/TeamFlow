const userService = require("../services/user.service");
const { sanitizeUser } = require("../utils/apiResponse");

function handleServiceError(err, res, next) {
  if (err instanceof userService.ForbiddenError) {
    return res.status(err.status).json({ message: err.message });
  }
  next(err);
}

// GET /users  (HR, Manager, CEO)
async function listUsers(req, res, next) {
  try {
    const { users, total, page, limit, totalPages } = await userService.listUsers(req.user.role, req.query);
    return res.status(200).json({
      users: users.map((u) => sanitizeUser(u, req.user.role)),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
}

// GET /users/:id  (HR, Manager, CEO, self)
async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id, req.user);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: sanitizeUser(user, req.user.role) });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// POST /users  (HR, CEO, Manager)
async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, role are required" });
    }

    const user = await userService.createUser(req.body);
    return res.status(201).json({ user: sanitizeUser(user, req.user.role) });
  } catch (err) {
    next(err);
  }
}

// PATCH /users/:id  (HR, CEO, self [limited fields])
async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.user, req.body);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: sanitizeUser(user, req.user.role) });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// DELETE /users/:id  (soft delete -> status: inactive)  (HR, CEO)
async function deactivateUser(req, res, next) {
  try {
    const user = await userService.deactivateUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deactivated" });
  } catch (err) {
    next(err);
  }
}

// POST /users/:id/avatar  (self, HR)
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const avatarUrl = await userService.uploadAvatar(req.params.id, req.user, req.file);
    return res.status(200).json({ avatarUrl });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deactivateUser,
  uploadAvatar,
};
