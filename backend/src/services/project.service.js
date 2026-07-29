const Project = require("../models/Project");
const Conversation = require("../models/Conversation");
const conversationService = require("./conversation.service");

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.status = 403;
  }
}
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// employee: only projects they're a member of
// team_leader: projects they're tied to (member or teamLeader)
// manager/ceo/hr: all projects
async function listProjects(viewer, { status, client } = {}) {
  const filter = {};
  if (status) filter.status = status;
  if (client) filter.client = client;

  if (!["manager", "ceo", "hr"].includes(viewer.role)) {
    filter.$or = [{ members: viewer.id }, { teamLeader: viewer.id }];
  }

  return Project.find(filter)
    .populate("teamLeader", "name email employeeId avatarUrl role designation department")
    .populate("members", "name email employeeId avatarUrl role designation department")
    .populate("client", "name company email")
    .sort({ createdAt: -1 });
}

async function createProject(creator, data) {
  const {
    title,
    description,
    client,
    status,
    startDate,
    endDate,
    dueDate,
    budget = 0,
    revenue = 0,
    expenses = 0,
    paidAmount = 0,
    pendingAmount,
    paymentStatus,
    teamLeader,
    members,
  } = data;

  if (client) {
    const Client = require("../models/Client");
    const clientDoc = await Client.findById(client);
    if (clientDoc && (clientDoc.status || "active").toLowerCase() === "inactive") {
      throw new BadRequestError("the client is inactive");
    }
  }

  const now = new Date();
  const effectiveStartDate = startDate ? new Date(startDate) : now;
  const effectiveDueDate = dueDate ? new Date(dueDate) : (endDate ? new Date(endDate) : null);
  const effectiveEndDate = endDate ? new Date(endDate) : effectiveDueDate;

  const targetValue = Number(revenue) || Number(budget) || 0;
  const numericPaid = Number(paidAmount) || 0;

  if (targetValue > 0 && numericPaid > targetValue) {
    throw new BadRequestError("Exceeded the pending amount");
  }

  const computedPending = pendingAmount !== undefined ? Number(pendingAmount) : Math.max(0, targetValue - numericPaid);
  let computedStatus = paymentStatus;
  if (!computedStatus) {
    if (numericPaid >= targetValue && targetValue > 0) {
      computedStatus = "Paid";
    } else if (numericPaid > 0) {
      computedStatus = "Partial";
    } else {
      computedStatus = "Pending";
    }
  }

  // Strictly include only the explicitly selected members
  const memberSet = new Set([...(Array.isArray(members) ? members : []).map(String)]);

  const project = await Project.create({
    title,
    description,
    client,
    status: status || "planning",
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
    dueDate: effectiveDueDate,
    budget: Number(budget) || 0,
    revenue: Number(revenue) || 0,
    expenses: Number(expenses) || 0,
    paidAmount: numericPaid,
    pendingAmount: computedPending,
    paymentStatus: computedStatus,
    teamLeader: teamLeader || null,
    members: Array.from(memberSet),
    documents: Array.isArray(data.documents) ? data.documents : [],
    manager: creator.id,
  });

  const participants = await conversationService.buildProjectGroupParticipants([
    creator.id,
    ...Array.from(memberSet),
    ...(teamLeader ? [teamLeader] : []),
  ]);
  await Conversation.create({
    type: "project_group",
    name: title,
    participants,
    project: project._id,
  });

  return project;
}

const GENERAL_EDITABLE_FIELDS = [
  "title",
  "description",
  "dueDate",
  "startDate",
  "endDate",
  "status",
  "budget",
  "revenue",
  "expenses",
  "paidAmount",
  "pendingAmount",
  "paymentStatus",
  "client",
  "teamLeader",
  "members",
];

// Team Leader of that project, Manager, CEO, HR
// Renaming keeps the Conversation's name in sync.
async function updateProject(project, requester, projectRoleFlags, data) {
  const { isPrivileged, isTeamLeader } = projectRoleFlags;
  if (!isPrivileged && !isTeamLeader) {
    throw new ForbiddenError("Forbidden");
  }

  for (const field of GENERAL_EDITABLE_FIELDS) {
    if (data[field] !== undefined) project[field] = data[field];
  }

  // Ensure numerical types
  if (data.expenses !== undefined) project.expenses = Number(project.expenses) || 0;
  if (data.paidAmount !== undefined) project.paidAmount = Number(project.paidAmount) || 0;
  if (data.revenue !== undefined) project.revenue = Number(project.revenue) || 0;
  if (data.budget !== undefined) project.budget = Number(project.budget) || 0;

  const targetVal = Number(project.revenue) || Number(project.budget) || 0;
  const numericPaid = Number(project.paidAmount) || 0;

  if (targetVal > 0 && numericPaid > targetVal) {
    throw new BadRequestError("Exceeded the pending amount");
  }

  // Recalculate pendingAmount if budget, revenue, or paidAmount modified and pending not explicitly set
  if (data.pendingAmount === undefined && (data.budget !== undefined || data.paidAmount !== undefined || data.revenue !== undefined)) {
    project.pendingAmount = Math.max(0, targetVal - numericPaid);
  }

  if (data.paymentStatus === undefined && (data.paidAmount !== undefined || data.budget !== undefined || data.revenue !== undefined)) {
    if (numericPaid >= targetVal && targetVal > 0) {
      project.paymentStatus = "Paid";
    } else if (numericPaid > 0) {
      project.paymentStatus = "Partial";
    } else {
      project.paymentStatus = "Pending";
    }
  }

  await project.save();

  if (data.title) {
    await Conversation.findOneAndUpdate(
      { project: project._id, type: "project_group" },
      { name: data.title }
    );
  }

  return project;
}

// Manager, CEO, HR — member pool for the project
async function addMembers(project, userIds) {
  const existing = new Set(project.members.map((m) => String(m._id || m)));
  userIds.forEach((id) => existing.add(String(id)));
  project.members = Array.from(existing);
  await project.save();

  await Conversation.updateOne(
    { project: project._id, type: "project_group" },
    { $addToSet: { participants: { $each: userIds.map(String) } } }
  );

  return project;
}

async function removeMember(project, userId) {
  project.members = project.members.filter((m) => String(m._id || m) !== userId);
  await project.save();

  await Conversation.updateOne(
    { project: project._id, type: "project_group" },
    { $pull: { participants: userId } }
  );

  return project;
}

// Manager, CEO, HR — exactly one Team Leader; replaces the current one
async function setTeamLeader(project, userId) {
  const isMember = project.members.some((m) => String(m._id || m) === userId);
  if (!isMember) {
    throw new BadRequestError("userId must be in project.members");
  }
  project.teamLeader = userId;
  await project.save();

  await Conversation.updateOne(
    { project: project._id, type: "project_group" },
    { $addToSet: { participants: userId } }
  );

  return project;
}

const PROGRESS_AREAS = ["frontend", "backend", "database"];

function normalizeProgressValue(value, label) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0 || num > 100) {
    throw new BadRequestError(`${label} progress must be a number between 0 and 100`);
  }
  return num;
}

// ONLY the project's Team Leader can update per-area progress. Manager/CEO/HR
// (and everyone else with project access) can only view it. `progress` is
// always recomputed as the average of the three areas.
async function updateProgress(project, requester, projectRoleFlags, breakdown) {
  const { isTeamLeader } = projectRoleFlags;
  if (!isTeamLeader) {
    throw new ForbiddenError("Only the project's Team Leader can update progress");
  }

  const current = project.progressBreakdown || {};
  const next = { ...current };

  let touched = false;
  for (const area of PROGRESS_AREAS) {
    if (breakdown[area] !== undefined) {
      next[area] = normalizeProgressValue(breakdown[area], area);
      touched = true;
    }
  }
  if (!touched) {
    throw new BadRequestError("Provide at least one of frontend, backend, database");
  }

  project.progressBreakdown = next;
  const average = PROGRESS_AREAS.reduce((sum, area) => sum + (next[area] || 0), 0) / PROGRESS_AREAS.length;
  project.progress = Math.round(average);

  if (project.progress >= 100 && project.status !== "completed") {
    project.status = "completed";
  }
  await project.save();
  return project;
}

async function addDocument(project, file, uploadedBy) {
  const document = {
    name: file.originalname,
    url: file.path,
    uploadedBy,
    uploadedAt: new Date(),
  };
  project.documents.push(document);
  await project.save();
  return project.documents[project.documents.length - 1];
}

async function removeDocument(project, documentId) {
  project.documents = project.documents.filter(
    (doc) => doc._id && doc._id.toString() !== documentId.toString()
  );
  await project.save();
  return project;
}

async function deleteProject(project) {
  const projectId = project._id || project.id || project;
  await Project.findByIdAndDelete(projectId);
  return { message: "Project deleted successfully" };
}

module.exports = {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
  setTeamLeader,
  updateProgress,
  addDocument,
  removeDocument,
  ForbiddenError,
  BadRequestError,
};
