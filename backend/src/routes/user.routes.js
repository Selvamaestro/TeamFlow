const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { uploadAvatar: uploadAvatarMiddleware } = require("../config/cloudinary");
const ctrl = require("../controllers/user.controller");
const { createUserValidator } = require("../validators/user.validator");
const validate = require("../middlewares/validate");

router.use(authenticate);

router.get("/", requireRole(["hr", "manager", "ceo"]), ctrl.listUsers);
router.get("/:id", ctrl.getUser); // fine-grained (self OR privileged) check happens in controller
router.post("/", requireRole(["hr", "ceo", "manager"]), createUserValidator, validate, ctrl.createUser);
router.patch("/:id", ctrl.updateUser); // fine-grained check happens in controller
router.delete("/:id", requireRole(["hr", "ceo"]), ctrl.deactivateUser);
router.post("/:id/avatar", uploadAvatarMiddleware.single("avatar"), ctrl.uploadAvatar);

module.exports = router;
