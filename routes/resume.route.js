const express = require("express");
const router = express.Router();
const { parseResume } = require("../controllers/resume.controller.js");

router.post("/parse-resume", parseResume);

module.exports = router;
