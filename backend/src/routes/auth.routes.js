const express = require("express");
const router = express.Router();
const { login, logout, me } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { loginValidator } = require("../validators/auth.validator");
const validate = require("../middlewares/validate");

router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", authenticate, me);

module.exports = router;
