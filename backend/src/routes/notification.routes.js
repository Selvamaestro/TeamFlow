const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/notification.controller");

router.use(authenticate);

router.get("/", ctrl.listNotifications);
router.patch("/:id/read", ctrl.markRead);
router.patch("/read-all", ctrl.markAllRead);

module.exports = router;
