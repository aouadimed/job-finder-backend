const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summary.controller");
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

router.use(protectedRoute.requireLogin);

router.route("/createOrUpdate").post(summaryController.createOrUpdateSummary);

router.route("/summarie").get(summaryController.getSummary);

module.exports = router;
