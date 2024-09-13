const express = require("express");
const jobApplicationController = require("../controllers/job_application.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post('/JobApplication', jobApplicationController.createJobApplication);

router.get('/JobApplication/:jobOfferId', jobApplicationController.getApplicantsForJobOffer);

router.patch('/JobApplication/:jobApplicationId', jobApplicationController.updateJobApplicationStatus);

router.get('/JobApplication', jobApplicationController.getJobApplications);

module.exports = router;
