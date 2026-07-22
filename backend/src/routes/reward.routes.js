const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/reward.controller");

router.use(authenticate);

router.get("/me", ctrl.myRewards);
router.get("/", requireRole(["hr", "manager", "ceo"]), ctrl.listRewards);
router.post("/", requireRole(["manager", "hr", "ceo"]), ctrl.createReward);

module.exports = router;
