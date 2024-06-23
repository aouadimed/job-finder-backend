const asyncHandler = require("express-async-handler");
const Education = require("../models/education.model");
const ApiError = require("../utils/apiError");
const moment = require("moment");

/**
 * @Desc   : Create an education entry
 * @Route  : @Post /api/education
 * @Access : Private
 */
exports.createEducation = asyncHandler(async (req, res, next) => {
  try {
    const {
      school,
      degree,
      field_of_study,
      startDate,
      endDate,
      grade,
      activities_and_societies,
      description,
    } = req.body;
    const userId = req.user._id;

    const education = new Education({
      user: userId,
      school,
      degree,
      field_of_study,
      startDate,
      endDate,
      grade,
      activities_and_societies,
      description,
    });

    await education.save();
    res.status(201).json(education);
  } catch (error) {
    return next(new ApiError("Failed to create education entry", 500));
  }
});

/**
 * @Desc   : Update an education entry
 * @Route  : @Put /api/education/:id
 * @Access : Private
 */
exports.updateEducation = asyncHandler(async (req, res, next) => {
  try {
    const {
      school,
      degree,
      field_of_study,
      startDate,
      endDate,
      grade,
      activities_and_societies,
      description,
    } = req.body;
    const userId = req.user._id;

    const education = await Education.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        school,
        degree,
        field_of_study,
        startDate,
        endDate,
        grade,
        activities_and_societies,
        description,
      },
      { new: true, runValidators: true }
    );

    if (!education) {
      return next(new ApiError("Education entry not found", 404));
    }

    res.status(200).json(education);
  } catch (error) {
    return next(new ApiError("Failed to update education entry", 500));
  }
});

/**
 * @Desc   : Get all education entries for the user
 * @Route  : @Get /api/education
 * @Access : Private
 */
exports.getEducations = asyncHandler(async (req, res, next) => {
    try {
      const educations = await Education.find({ user: req.user._id });
  
      const formattedEducations = educations.map((education) => {
        return {
          _id: education._id,
          school: education.school,
          field_of_study: education.field_of_study,
          startDate: education.startDate,
          endDate: education.endDate,
        };
      });
  
      res.status(200).json(formattedEducations);
    } catch (error) {
      return next(new ApiError("Failed to get education entries", 500));
    }
  });
  

/**
 * @Desc   : Get a single education entry by ID
 * @Route  : @Get /api/education/:id
 * @Access : Private
 */
exports.getEducation = asyncHandler(async (req, res, next) => {
  try {
    const education = await Education.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!education) {
      return next(new ApiError("Education entry not found", 404));
    }

    res.status(200).json(education);
  } catch (error) {
    return next(new ApiError("Failed to get education entry", 500));
  }
});

/**
 * @Desc   : Delete an education entry
 * @Route  : @Delete /api/education/:id
 * @Access : Private
 */
exports.deleteEducation = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const education = await Education.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!education) {
      return next(new ApiError("Education entry not found", 404));
    }

    res.status(200).json({ message: "Education entry deleted successfully" });
  } catch (error) {
    return next(new ApiError("Failed to delete education entry", 500));
  }
});
