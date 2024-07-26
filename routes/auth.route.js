const express = require("express");
const router = express.Router();

const authValidator = require("../validator/authValidator");
const authController = require("../controllers/auth.controller");

const protectedRoute = require("../middleware/protectedRoute");
//const userController = require("../controllers/user.controller");
/* ----------------------------------------------------- */
router.post(
  "/register",
  authController.registerUser
);

router.post(
  "/login",
  authValidator.loginUserValidator,
  authController.loginUser
);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/verifyResetCode", authController.verifyPasswordResetCode);
router.put("/resetPassword", authController.resetPassword);

/*
router.put(
  "/updateUserImg",
  protectedRoute.requireLogin,
  protectedRoute.allowedTo("user"),
  userController.uploadUserImage,
  userController.resizeImage,
  authController.editUserAvatar
);*/

module.exports = router;
