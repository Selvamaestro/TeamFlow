const { body } = require("express-validator");

const createUserValidator = [
  body("name").isString().trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isString().isLength({ min: 8 }).withMessage("password must be at least 8 characters"),
  body("role")
    .isIn(["ceo", "manager", "hr", "team_leader", "employee"])
    .withMessage("Invalid role"),
  body("phone").optional().isString(),
  body("department").optional().isString(),
  body("designation").optional().isString(),
  body("employmentType").optional().isIn(["full_time", "contract", "intern"]),
  body("joiningDate").optional().isISO8601().toDate(),
  body("reportingManager").optional({ nullable: true }).isMongoId(),
];

module.exports = { createUserValidator };
