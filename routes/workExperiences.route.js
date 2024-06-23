// routes/workExperienceRoutes.js

const express = require('express');
const { createWorkExperienceValidator, updateWorkExperienceValidator } = require('../validator/workExperienceValidator');
const { createWorkExperience, updateWorkExperience, getWorkExperiences, getWorkExperience ,deleteWorkExperience} = require('../controllers/workExperiences.controller');
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

const router = express.Router();


router.use(protectedRoute.requireLogin);

router.post('/create',createWorkExperienceValidator, createWorkExperience);
router.put('/update/:id', updateWorkExperienceValidator, updateWorkExperience);
router.get('/work-experiences', getWorkExperiences);
router.get('/work-experience/:id', getWorkExperience);
router.delete('/delete/:id', deleteWorkExperience);


module.exports = router;
