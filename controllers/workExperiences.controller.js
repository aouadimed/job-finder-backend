// controllers/workExperienceController.js

const asyncHandler = require("express-async-handler");
const WorkExperience = require("../models/work_experience.model");
const ApiError = require("../utils/apiError");
const moment = require("moment");
/**
 * @Desc   : Create a work experience
 * @Route  : @Post /api/work-experience
 * @Access : Private
 */
exports.createWorkExperience = asyncHandler(async (req, res, next) => {
  try {
    const {
      jobTitle,
      companyName,
      employmentType,
      location,
      locationType,
      startDate,
      endDate,
      description,
      ifStillWorking,
    } = req.body;
    const userId = req.user._id;

    const workExperience = new WorkExperience({
      user: userId,
      jobTitle,
      companyName,
      employmentType,
      location,
      locationType,
      startDate,
      endDate,
      description,
      ifStillWorking,
    });

    await workExperience.save();
    res.status(201).json(workExperience);
  } catch (error) {
    return next(new ApiError("Failed to create work experience", 500));
  }
});

/**
 * @Desc   : Update a work experience
 * @Route  : @Put /api/work-experience/:id
 * @Access : Private
 */
exports.updateWorkExperience = asyncHandler(async (req, res, next) => {
  try {
    const {
      jobTitle,
      companyName,
      employmentType,
      location,
      locationType,
      startDate,
      endDate,
      description,
      ifStillWorking,
    } = req.body;
    const userId = req.user._id;

    const workExperience = await WorkExperience.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        jobTitle,
        companyName,
        employmentType,
        location,
        locationType,
        startDate,
        endDate,
        description,
        ifStillWorking,
      },
      { new: true, runValidators: true }
    );

    if (!workExperience) {
      return next(new ApiError("Work experience not found", 404));
    }

    res.status(200).json(workExperience);
  } catch (error) {
    return next(new ApiError("Failed to update work experience", 500));
  }
});

/**
 * @Desc   : Get all work experiences for the user
 * @Route  : @Get /api/work-experiences
 * @Access : Private
 */
exports.getWorkExperiences = asyncHandler(async (req, res, next) => {
  try {
    const workExperiences = await WorkExperience.find({ user: req.user._id });

    const formattedExperiences = workExperiences.map((experience) => ({
      _id: experience._id,
      jobTitle: experience.jobTitle,
      companyName: experience.companyName,
      startDate: experience.startDate,
      endDate: experience.ifStillWorking ? null : experience.endDate,
      ifStillWorking: experience.ifStillWorking,
    }));

    res.status(200).json(formattedExperiences);
  } catch (error) {
    return next(new ApiError('Failed to get work experiences', 500));
  }
});

/**
 * @Desc   : Get a single work experience by ID
 * @Route  : @Get /api/work-experience/:id
 * @Access : Private
 */
exports.getWorkExperience = asyncHandler(async (req, res, next) => {
  try {
    const workExperience = await WorkExperience.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workExperience) {
      return next(new ApiError("Work experience not found", 404));
    }

    res.status(200).json(workExperience);
  } catch (error) {
    return next(new ApiError("Failed to get work experience", 500));
  }
});

/**
 * @Desc   : Delete a work experience
 * @Route  : @Delete /api/work-experience/:id
 * @Access : Private
 */
exports.deleteWorkExperience = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const workExperience = await WorkExperience.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!workExperience) {
      return next(new ApiError("Work experience not found", 404));
    }

    res.status(200).json({ message: "Work experience deleted successfully" });
  } catch (error) {
    return next(new ApiError("Failed to delete work experience", 500));
  }
});
