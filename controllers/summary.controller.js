const asyncHandler = require("express-async-handler");
const Summary = require("../models/summary.model");
const ApiError = require("../utils/apiError");

/* ----------------------------------------------------- */
/**
 * @Desc   : Create or update a summary
 * @Route  : @Post /api/summary
 * @access : Private
 */
/* ----------------------------------------------------- */
exports.createOrUpdateSummary = asyncHandler(async (req, res, next) => {
  try {
    const { description } = req.body;
    const userId = req.user._id;

    let summary = await Summary.findOne({ user: userId });

    if (summary) {
      summary.description = description;
      await summary.save();
      res.status(200).json(summary);
    } else {
      summary = new Summary({ description: description, user: userId });
      await summary.save();
      res.status(201).json(summary);
    }
  } catch (error) {
    return next(new ApiError("Failed to create or update summary", 500));
  }
});

/**
 * @Desc   : Get user summaries
 * @Route  : @Get /api/summaries
 * @Access : Private
 */
exports.getSummary = asyncHandler(async (req, res, next) => {
  try {
    const summaries = await Summary.find({ user: req.user._id });
    res.status(200).json(summaries);
  } catch (error) {
    return next(new ApiError("Failed to get summaries", 500));
  }
});
