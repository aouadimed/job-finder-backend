const express = require("express");
const profilController = require("../controllers/profil.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.get('/CVCompletion',profilController.calculateCVCompletion);

module.exports = router;
