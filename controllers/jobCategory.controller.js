const asyncHandler = require('express-async-handler');
const JobCategory = require('../models/jobCategory.model');
const ApiError = require('../utils/apiError');

/**
 * @Desc   : Fetch job categories and subcategories based on search query
 * @Route  : @Post /api/job-category
 * @Access : Private
 */
exports.getJobCategory = asyncHandler(async (req, res, next) => {
  try {
    const searchQuery = req.body.query || ''; 
    const jobCategory = await JobCategory.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } }, 
            { 'subcategories.name': { $regex: searchQuery, $options: 'i' } } 
          ]
        }
      },
      {
        $project: {
          name: 1,
          subcategories: {
            $filter: {
              input: '$subcategories',
              as: 'subcategory',
              cond: { $regexMatch: { input: '$$subcategory.name', regex: searchQuery, options: 'i' } }
            }
          }
        }
      }
    ]);

    res.json(jobCategory);
  } catch (err) {
    return next(new ApiError(err.message, 500));
  }
});
