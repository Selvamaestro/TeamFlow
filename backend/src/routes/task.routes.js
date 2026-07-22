const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const { requireProjectAccess } = require("../middlewares/projectAccess.middleware");
const ctrl = require("../controllers/task.controller");

// nested: /api/v1/projects/:projectId/tasks
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.use(authenticate);
nestedRouter.get("/", requireProjectAccess, ctrl.listTasks);
nestedRouter.post("/", requireProjectAccess, ctrl.createTask);

// top-level: /api/v1/tasks/:id...
const topRouter = express.Router();
topRouter.use(authenticate);
topRouter.get("/:id", ctrl.getTask);
topRouter.patch("/:id/status", ctrl.updateTaskStatus);
topRouter.patch("/:id", ctrl.updateTask);
topRouter.delete("/:id", ctrl.deleteTask);

module.exports = { nestedRouter, topRouter };
