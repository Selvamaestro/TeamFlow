const projectService = require("../services/project.service");
const { sanitizeProject } = require("../utils/apiResponse");

function handleServiceError(err, res, next) {
  if (err instanceof projectService.ForbiddenError || err instanceof projectService.BadRequestError) {
    return res.status(err.status).json({ message: err.message });
  }
  next(err);
}

// GET /projects
async function listProjects(req, res, next) {
  try {
    const projects = await projectService.listProjects(req.user, req.query);
    return res.status(200).json({
      projects: projects.map((p) => sanitizeProject(p, req.user.role)),
    });
  } catch (err) {
    next(err);
  }
}

// GET /projects/:id  (members, Team Leader, manager, CEO, HR — access already checked by requireProjectAccess)
async function getProject(req, res, next) {
  try {
    return res.status(200).json({ project: sanitizeProject(req.project, req.user.role) });
  } catch (err) {
    next(err);
  }
}

// POST /projects  (Manager, CEO, HR)
async function createProject(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const project = await projectService.createProject(req.user, req.body);
    return res.status(201).json({ project: sanitizeProject(project, req.user.role) });
  } catch (err) {
    next(err);
  }
}

// PATCH /projects/:id (description, dueDate, title...)  Team Leader of that project, Manager, CEO, HR
async function updateProject(req, res, next) {
  try {
    const project = await projectService.updateProject(req.project, req.user, req.projectRoleFlags, req.body);
    return res.status(200).json({ project: sanitizeProject(project, req.user.role) });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// POST /projects/:id/members  (Manager, CEO, HR) — member pool for the project
async function addMembers(req, res, next) {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds must be a non-empty array" });
    }

    const project = await projectService.addMembers(req.project, userIds);
    return res.status(200).json({ project: sanitizeProject(project, req.user.role) });
  } catch (err) {
    next(err);
  }
}

// DELETE /projects/:id/members/:userId  (Manager, CEO, HR)
async function removeMember(req, res, next) {
  try {
    const project = await projectService.removeMember(req.project, req.params.userId);
    return res.status(200).json({ project: sanitizeProject(project, req.user.role) });
  } catch (err) {
    next(err);
  }
}

// POST /projects/:id/team-leader  (Manager, CEO, HR) — exactly one Team Leader; replaces the current one
async function setTeamLeader(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const project = await projectService.setTeamLeader(req.project, userId);
    return res.status(200).json({ project: sanitizeProject(project, req.user.role) });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// POST /projects/:id/documents  (members, Team Leader, manager, CEO)  multipart -> Cloudinary
async function addDocument(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const document = await projectService.addDocument(req.project, req.file, req.user.id);
    return res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
}

// DELETE /projects/:id (Manager, CEO, HR)
async function deleteProject(req, res, next) {
  try {
    await projectService.deleteProject(req.project);
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
  setTeamLeader,
  addDocument,
};
