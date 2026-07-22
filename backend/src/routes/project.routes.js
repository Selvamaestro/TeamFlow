const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { requireProjectAccess } = require("../middlewares/projectAccess.middleware");
const { uploadProjectDocument } = require("../config/cloudinary");
const ctrl = require("../controllers/project.controller");

router.use(authenticate);

router.get("/", ctrl.listProjects);
router.get("/:id", requireProjectAccess, ctrl.getProject);
router.delete("/:id", requireRole(["manager", "ceo", "hr"]), requireProjectAccess, ctrl.deleteProject);
router.post("/", requireRole(["manager", "ceo", "hr"]), ctrl.createProject);
router.patch("/:id", requireProjectAccess, ctrl.updateProject);
router.post("/:id/members", requireRole(["manager", "ceo", "hr"]), requireProjectAccess, ctrl.addMembers);
router.delete(
  "/:id/members/:userId",
  requireRole(["manager", "ceo", "hr"]),
  requireProjectAccess,
  ctrl.removeMember
);
router.post(
  "/:id/team-leader",
  requireRole(["manager", "ceo", "hr"]),
  requireProjectAccess,
  ctrl.setTeamLeader
);
router.post(
  "/:id/documents",
  requireProjectAccess,
  uploadProjectDocument.single("document"),
  ctrl.addDocument
);

module.exports = router;
