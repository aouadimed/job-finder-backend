const express = require("express");
const {
  createProject,
  updateProject,
  getProjects,
  getProject,
  deleteProject,
} = require("../controllers/project.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post("/create", createProject);
router.put("/update/:id", updateProject);
router.get("/projects", getProjects);
router.get("/project/:id", getProject);
router.delete("/delete/:id", deleteProject);

module.exports = router;
