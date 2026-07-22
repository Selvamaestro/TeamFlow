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

// side effect: auto-creates the project's project_group Conversation, pre-populated
// with every ceo/manager ("admin") plus the creator
async function createProject(creator, { title, description, client, dueDate, revenue, teamLeader, members }) {
  const project = await Project.create({
    title,
    description,
    client,
    dueDate,
    revenue,
    teamLeader: teamLeader || null,
    members: Array.isArray(members) ? members : [],
    manager: creator.id,
  });

  const participants = await conversationService.buildProjectGroupParticipants([creator.id]);
  await Conversation.create({
    type: "project_group",
    name: title,
    participants,
    project: project._id,
  });

  return project;
}

const GENERAL_EDITABLE_FIELDS = ["title", "description", "dueDate", "status"];

// Team Leader of that project, Manager, CEO, HR
// Renaming keeps the Conversation's name in sync.
async function updateProject(project, requester, projectRoleFlags, data) {
  const { isPrivileged, isTeamLeader } = projectRoleFlags;
  if (!isPrivileged && !isTeamLeader) {
    throw new ForbiddenError("Forbidden");
  }

  if (requester.role === "ceo" && data.revenue !== undefined) {
    project.revenue = data.revenue;
  }

  for (const field of GENERAL_EDITABLE_FIELDS) {
    if (data[field] !== undefined) project[field] = data[field];
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
  const existing = new Set(project.members.map((m) => m.toString()));
  userIds.forEach((id) => existing.add(id.toString()));
  project.members = Array.from(existing);
  await project.save();
  return project;
}

async function removeMember(project, userId) {
  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();
  return project;
}

// Manager, CEO, HR — exactly one Team Leader; replaces the current one
async function setTeamLeader(project, userId) {
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isMember) {
    throw new BadRequestError("userId must be in project.members");
  }
  project.teamLeader = userId;
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
  addDocument,
  ForbiddenError,
  BadRequestError,
};
