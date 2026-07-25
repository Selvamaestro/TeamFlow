const express = require("express");
const router = express.Router();
console.log("Auth routes loaded");
const {
    login,
    logout,
    me,
    updateProfile,
    changePassword,
    uploadAvatar,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { loginValidator } = require("../validators/auth.validator");
const validate = require("../middlewares/validate");
const multer = require("multer");

const upload = multer({
    dest: "uploads/",
});
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.put("/profile", authenticate, updateProfile);
router.put("/change-password", authenticate, changePassword);
router.post(
    "/upload-avatar",
    authenticate,
    upload.single("avatar"),
    uploadAvatar
);
module.exports = router;
 