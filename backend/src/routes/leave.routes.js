const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/leave.controller");

router.use(authenticate);

router.post("/", ctrl.createLeave);
router.get("/me", ctrl.myLeave);
router.get("/", requireRole(["hr", "manager", "ceo"]), ctrl.listLeave);
router.patch("/:id/decision", requireRole(["hr", "manager", "ceo"]), ctrl.decideLeave);

module.exports = router;
