const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

router.use(protectedRoute.requireLogin);

router.route("/profil-header").get(userController.getProfilHeader);

router.route("/profil-header").put(userController.updateUserProfile);

module.exports = router;
