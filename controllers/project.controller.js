const asyncHandler = require("express-async-handler");
const Project = require("../models/project.model");
const ApiError = require("../utils/apiError");

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = asyncHandler(async (req, res, next) => {
  try {
    const {
      projectName,
      workExperience,
      startDate,
      endDate,
      description,
      projectUrl,
      ifStillWorkingOnIt,
    } = req.body;
    const userId = req.user._id;

    const project = new Project({
      user: userId,
      projectName,
      workExperience,
      startDate,
      endDate,
      description,
      projectUrl,
      ifStillWorkingOnIt,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    return next(new ApiError("Failed to create project", 500));
  }
});

// @desc    Get all projects of a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).populate(
      "workExperience",
      {
        jobTitle: 1,
        companyName: 1,
      }
    );

    const formattedProjects = projects.map((project) => ({
      _id: project._id,
      projectName: project.projectName,
      workExperience: project.workExperience,
      startDate: project.startDate,
      endDate: project.ifStillWorkingOnIt ? null : project.endDate,
      ifStillWorkingOnIt: project.ifStillWorkingOnIt,
    }));

    res.status(200).json(formattedProjects);
  } catch (error) {
    return next(new ApiError("Failed to get projects", 500));
  }
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("workExperience", {
      _id: 1,
    });

    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    res.status(200).json(project);
  } catch (error) {
    return next(new ApiError("Failed to get project", 500));
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res, next) => {
  try {
    const {
      projectName,
      workExperience,
      startDate,
      endDate,
      description,
      projectUrl,
      ifStillWorkingOnIt,
    } = req.body;
    const userId = req.user._id;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        projectName,
        workExperience,
        startDate,
        endDate,
        description,
        projectUrl,
        ifStillWorkingOnIt,
      }
    );

    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    res.status(200).json(project);
  } catch (error) {
    return next(new ApiError("Failed to update project", 500));
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!project) {
      return next(new ApiError("Project not found", 404));
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    return next(new ApiError("Failed to delete project", 500));
  }
});
