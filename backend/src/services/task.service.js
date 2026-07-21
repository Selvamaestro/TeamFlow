const Task = require("../models/Task");
const Project = require("../models/Project");
const Conversation = require("../models/Conversation");
const notify = require("../utils/notify");

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

function isPrivilegedRole(role) {
  return ["manager", "ceo"].includes(role);
}

// Team Leader/manager/CEO see all tasks; plain Employee is force-filtered to assignedTo: currentUser
async function listTasks(project, projectRoleFlags, userId, { status } = {}) {
  const filter = { project: project._id };
  if (status) filter.status = status;

  const { isPrivileged, isTeamLeader } = projectRoleFlags;
  if (!isPrivileged && !isTeamLeader) {
    filter.assignedTo = userId;
  }

  return Task.find(filter).sort({ createdAt: -1 });
}

async function getTaskForViewer(taskId, viewer) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null };

  const project = await Project.findById(task.project);
  const isPrivileged = isPrivilegedRole(viewer.role);
  const isTeamLeader = project.teamLeader && project.teamLeader.toString() === viewer.id;
  const isAssignee = task.assignedTo.toString() === viewer.id;

  if (!isPrivileged && !isTeamLeader && !isAssignee) {
    throw new ForbiddenError("Forbidden");
  }

  return { task, project };
}

// Team Leader of that project only; Manager/CEO can also, for oversight.
// enforce: assignedTo must be in project.members; requester must be project.teamLeader or manager/ceo
// side effect: assignedTo is added to the project_group Conversation participants if not already there
async function createTask(app, project, requester, { title, description, assignedTo, dueDate, priority }) {
  const isTeamLeader = project.teamLeader && project.teamLeader.toString() === requester.id;
  const isPrivileged = isPrivilegedRole(requester.role);

  if (!isTeamLeader && !isPrivileged) {
    throw new ForbiddenError("Only the project's Team Leader (or Manager/CEO) can assign tasks");
  }

  const isMember = project.members.some((m) => m.toString() === assignedTo);
  if (!isMember) {
    throw new BadRequestError("assignedTo must be one of project.members");
  }

  const task = await Task.create({
    project: project._id,
    title,
    description,
    assignedTo,
    assignedBy: requester.id,
    dueDate,
    priority,
  });

  const conversation = await Conversation.findOne({ project: project._id, type: "project_group" });
  if (conversation && !conversation.participants.some((p) => p.toString() === assignedTo)) {
    conversation.participants.push(assignedTo);
    await conversation.save();
  }

  await notify(app, {
    user: assignedTo,
    type: "task_assigned",
    title: "New task assigned",
    body: `You were assigned: ${title}`,
    link: `/projects/${project._id}`,
  });

  return task;
}

const SELF_TRANSITIONS = ["in_progress", "submitted"];
const REVIEWER_TRANSITIONS = ["approved", "rejected"];
const VALID_STATUSES = ["todo", "in_progress", "submitted", "approved", "rejected"];

// assignee (self only, to in_progress/submitted); Team Leader/manager (to approved/rejected)
async function updateTaskStatus(taskId, requester, { status, submissionNote }) {
  if (!VALID_STATUSES.includes(status)) {
    throw new BadRequestError("Invalid status");
  }

  const task = await Task.findById(taskId);
  if (!task) return null;

  const project = await Project.findById(task.project);
  const isAssignee = task.assignedTo.toString() === requester.id;
  const isTeamLeader = project.teamLeader && project.teamLeader.toString() === requester.id;
  const isPrivileged = isPrivilegedRole(requester.role);

  if (SELF_TRANSITIONS.includes(status)) {
    if (!isAssignee) throw new ForbiddenError("Only the assignee can move a task to this status");
  } else if (REVIEWER_TRANSITIONS.includes(status)) {
    if (!isTeamLeader && !isPrivileged) throw new ForbiddenError("Only the Team Leader or Manager/CEO can approve/reject");
  } else if (status === "todo") {
    if (!isAssignee && !isTeamLeader && !isPrivileged) throw new ForbiddenError("Forbidden");
  }

  task.status = status;
  if (submissionNote !== undefined) task.submissionNote = submissionNote;
  await task.save();

  return task;
}

const EDITABLE_FIELDS = ["title", "description", "dueDate", "priority"];

// assigner (Team Leader), manager, CEO
async function updateTask(taskId, requester, data) {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const isAssigner = task.assignedBy.toString() === requester.id;
  const isPrivileged = isPrivilegedRole(requester.role);
  if (!isAssigner && !isPrivileged) throw new ForbiddenError("Forbidden");

  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) task[field] = data[field];
  }
  await task.save();

  return task;
}

// Team Leader who assigned it, manager, CEO
async function deleteTask(taskId, requester) {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const isAssigner = task.assignedBy.toString() === requester.id;
  const isPrivileged = isPrivilegedRole(requester.role);
  if (!isAssigner && !isPrivileged) throw new ForbiddenError("Forbidden");

  await task.deleteOne();
  return task;
}

module.exports = {
  listTasks,
  getTaskForViewer,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  ForbiddenError,
  BadRequestError,
};
