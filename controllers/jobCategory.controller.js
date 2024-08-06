const asyncHandler = require('express-async-handler');
const JobCategory = require('../models/jobCategory.model');
const JobOffer = require('../models/jobOffer.model'); 
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


/**
 * @Desc   : Retrieve the most assigned categories to job offers
 * @Route  : @Get /api/job-category
 * @Access : Private
 */
exports.getMostAssignedCategories = asyncHandler(async (req, res, next) => {
  try {

    const mostAssignedCategories = await JobOffer.aggregate([
      {
        $group: {
          _id: '$categoryId', 
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: '$category.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(mostAssignedCategories);
  } catch (err) {
    return next(new ApiError(err.message, 500));
  }
});

