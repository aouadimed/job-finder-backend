const express = require("express");
const router = express.Router();
const { parseResume } = require('../controllers/resume.controller.js');

// Route for parsing resumes
router.post('/parse-resume', parseResume);

module.exports = router;
