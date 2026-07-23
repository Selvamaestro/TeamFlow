const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Project = require("../models/Project");
const Attendance = require("../models/Attendance");
const Reward = require("../models/Reward");
const conversationService = require("./conversation.service");

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.status = 403;
  }
}

async function generateEmployeeId() {
  const count = await User.countDocuments();
  return `EMP-${String(count + 1).padStart(4, "0")}`;
}

async function listUsers(viewerRole, { department, role, status, search, page = 1, limit = 25 } = {}) {
  const filter = {};
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: new RegExp(safe, "i") },
      { email: new RegExp(safe, "i") },
      { employeeId: new RegExp(safe, "i") },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(viewerRole === "manager" ? "-salary" : "")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

 const enrichedUsers = await Promise.all(
  users.map(async (user) => {
    // Find current project
    const project = await Project.findOne({
      members: user._id,
    });

    // Count attendance records
    const attendanceCount = await Attendance.countDocuments({
      user: user._id,
      status: "present",
    });

    // Calculate total reward points
    const rewards = await Reward.find({
      user: user._id,
    });

    const rewardScore = rewards.reduce(
      (sum, reward) => sum + reward.points,
      0
    );

    return {
      ...user.toObject(),
      currentProject: project?.title || "-",
      attendance: attendanceCount,
      rewardScore,
    };
  })
);

return {
  users: enrichedUsers,
  total,
  page: pageNum,
  limit: limitNum,
  totalPages: Math.ceil(total / limitNum),
};
}

// HR, Manager, CEO, self
async function getUserById(id, viewer) {
  if (!["hr", "manager", "ceo"].includes(viewer.role) && viewer.id !== id) {
    throw new ForbiddenError("Forbidden");
  }

  const user = await User.findById(id).select("+salary");

  if (!user) return null;

  // Current projects
  const projects = await Project.find({
    members: user._id,
  }).select("title status progress");

  // Attendance count
  const attendance = await Attendance.countDocuments({
    user: user._id,
    status: "present",
  });

  // Reward score
  const rewards = await Reward.find({
    user: user._id,
  });

  const rewardScore = rewards.reduce(
    (sum, reward) => sum + reward.points,
    0
  );

  return {
    ...user.toObject(),
    projects,
    attendance,
    rewardScore,
  };
}
// side effects: adds the new user to the global channel once, and — if they're
// themself an admin (ceo/manager) — backfills them into every existing project chat
async function createUser(data) {
  const {
    name, email, password, phone, department, designation,
    employmentType, joiningDate, reportingManager, role,
  } = data;

  const passwordHash = await bcrypt.hash(password, 10);
  const employeeId = await generateEmployeeId();

  const user = await User.create({
    employeeId,
    name,
    email,
    passwordHash,
    phone,
    department,
    designation,
    employmentType,
    joiningDate,
    reportingManager: reportingManager || null,
    role,
  });

  await conversationService.addUserToGlobalChannel(user._id);
  if (conversationService.ADMIN_ROLES.includes(user.role)) {
    await conversationService.addUserToAllProjectGroups(user._id);
  }

  return user;
}

const SELF_EDITABLE_FIELDS = ["name", "phone", "avatarUrl"];
const PRIVILEGED_EDITABLE_FIELDS = [
  "name", "phone", "avatarUrl", "department", "designation",
  "employmentType", "joiningDate", "reportingManager", "role", "status", "salary",
];

// HR, CEO, self [limited fields]
async function updateUser(id, requester, data) {
  const isSelf = requester.id === id;
  const isPrivileged = ["hr", "ceo"].includes(requester.role);

  if (!isSelf && !isPrivileged) {
    throw new ForbiddenError("Forbidden");
  }

  const allowedFields = isPrivileged ? PRIVILEGED_EDITABLE_FIELDS : SELF_EDITABLE_FIELDS;
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("+salary");
}

// soft delete -> status: inactive
async function deactivateUser(id) {
  return User.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
}

// self, HR
async function uploadAvatar(id, requester, file) {
  const isSelf = requester.id === id;
  if (!isSelf && requester.role !== "hr") {
    throw new ForbiddenError("Forbidden");
  }

  const avatarUrl = file.path; // CloudinaryStorage sets .path to the secure_url
  await User.findByIdAndUpdate(id, { avatarUrl });
  return avatarUrl;
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  uploadAvatar,
  ForbiddenError,
};
