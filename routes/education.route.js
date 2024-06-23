const express = require("express");
const {
  createEducation,
  updateEducation,
  getEducations,
  getEducation,
  deleteEducation,
} = require("../controllers/education.controller");
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post("/create", createEducation);
router.put("/update/:id", updateEducation);
router.get("/educations", getEducations);
router.get("/education/:id", getEducation);
router.delete("/delete/:id", deleteEducation);

module.exports = router;
