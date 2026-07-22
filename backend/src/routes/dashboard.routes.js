const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/dashboard.controller");

router.use(authenticate);

router.get("/overview", requireRole(["manager", "ceo"]), ctrl.overview);
router.get("/revenue", requireRole(["ceo"]), ctrl.revenue);

module.exports = router;
