const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

router.use(protectedRoute.requireLogin);

router.route("/profil-header").get(userController.getProfilHeader);

module.exports = router;
