const taskService = require("../services/task.service");

function handleServiceError(err, res, next) {
  if (err instanceof taskService.ForbiddenError || err instanceof taskService.BadRequestError) {
    return res.status(err.status).json({ message: err.message });
  }
  next(err);
}

// GET /projects/:projectId/tasks
async function listTasks(req, res, next) {
  try {
    const tasks = await taskService.listTasks(req.project, req.projectRoleFlags, req.user.id, req.query);
    return res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
}

// GET /tasks/:id  (assignee, Team Leader of that project, manager, CEO)
async function getTask(req, res, next) {
  try {
    const { task } = await taskService.getTaskForViewer(req.params.id, req.user);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.status(200).json({ task });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// POST /projects/:projectId/tasks  (Team Leader of that project only; Manager/CEO can also, for oversight)
async function createTask(req, res, next) {
  try {
    const { title, assignedTo } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({ message: "title and assignedTo are required" });
    }

    const task = await taskService.createTask(req.app, req.project, req.user, req.body);
    return res.status(201).json({ task });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// PATCH /tasks/:id/status
async function updateTaskStatus(req, res, next) {
  try {
    const task = await taskService.updateTaskStatus(req.params.id, req.user, req.body);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.status(200).json({ task });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// PATCH /tasks/:id (edit title/desc/due date)  assigner (Team Leader), manager, CEO
async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask(req.params.id, req.user, req.body);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.status(200).json({ task });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

// DELETE /tasks/:id  (Team Leader who assigned it, manager, CEO)
async function deleteTask(req, res, next) {
  try {
    const task = await taskService.deleteTask(req.params.id, req.user);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
