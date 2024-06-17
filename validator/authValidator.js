const { check } = require("express-validator");

const validatorMiddleware = require("../middleware/validatorMiddleware");

const registerUserValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("first name required")
    .isLength({ min: 3 })
    .withMessage("first name must be at least 3 characters"),
  check("lastName")
    .notEmpty()
    .withMessage("first name required")
    .isLength(3)
    .withMessage("last name must be at least 3 characters"),
  check("email").notEmpty().withMessage("Email required").isEmail(),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  validatorMiddleware,
];

const loginUserValidator = [
  check("email").notEmpty().withMessage("Email required").isEmail(),
  check("password")
    .notEmpty()
    .withMessage("password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  validatorMiddleware,
];

module.exports = { registerUserValidator, loginUserValidator };
