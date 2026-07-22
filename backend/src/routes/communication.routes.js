const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/communication.controller");

router.use(authenticate);

router.get("/", ctrl.listConversations);
router.post("/", ctrl.createConversation);
router.get("/:id/messages", ctrl.listMessages);
router.post("/:id/messages", ctrl.createMessage);

module.exports = router;
