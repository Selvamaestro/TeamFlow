const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/attendance.controller");

router.use(authenticate);

router.post("/check-in", ctrl.checkIn);
router.post("/check-out", ctrl.checkOut);
router.get("/me", ctrl.myAttendance);
router.get("/", requireRole(["hr", "manager", "ceo"]), ctrl.listAttendance);

module.exports = router;
