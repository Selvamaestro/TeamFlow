const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const ctrl = require("../controllers/agenda.controller");

router.use(authenticate);

router.get("/", requireRole(["ceo"]), ctrl.getAgenda);

router.post("/", requireRole(["ceo"]), ctrl.createAgenda);

router.patch("/:id", requireRole(["ceo"]), ctrl.updateAgenda);

router.delete("/:id", requireRole(["ceo"]), ctrl.deleteAgenda);

module.exports = router;