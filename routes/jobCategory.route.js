const express = require("express");
const jobCategoriesController = require("../controllers/jobCategory.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);


router.post('/job-category',jobCategoriesController.getJobCategory);

module.exports = router;
