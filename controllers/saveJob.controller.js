const asyncHandler = require("express-async-handler");
const SavedJob = require("../models/saveJob.model");
const JobOffer = require("../models/jobOffer.model");
const ApiError = require("../utils/apiError");
const Company = require("../models/company.model");
const Category = require('../models/jobCategory.model');

/**
 * @Desc   : Save a job offer
 * @Route  : @Post /api/saved-jobs
 * @Access : Private
 */
exports.saveJobOffer = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { jobOfferId } = req.body;

  const jobOffer = await JobOffer.findById(jobOfferId);
  if (!jobOffer) {
    return next(new ApiError("Job offer not found", 404));
  }

  const savedJob = new SavedJob({
    user: user._id,
    jobOffer: jobOfferId,
  });

  await savedJob.save();
  res.status(201).json(savedJob);
});


/**
 * @Desc   : Get all saved job offers for the logged-in user with pagination and search
 * @Route  : @Get /api/saved-jobs
 * @Access : Private
 */
exports.getSavedJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const { user } = req;

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  let query = { user: user._id };

  try {
    if (search) {
      const matchingCompanies = await Company.find({
        companyName: { $regex: search, $options: "i" },
      }).select("_id user");

      const userIds = matchingCompanies.map(company => company.user);

      const matchingCategories = await Category.find({
        'subcategories.name': { $regex: search, $options: "i" }
      }).select('_id subcategories');

      const subcategoryIds = [];
      matchingCategories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          if (subcategory.name.match(new RegExp(search, 'i'))) {
            subcategoryIds.push(subcategory._id.toString());
          }
        });
      });

      const matchingJobOffers = await JobOffer.find({
        $or: [
          { subcategoryId: { $in: subcategoryIds } },
          { user: { $in: userIds } }
        ]
      }).select('_id');

      const jobOfferIds = matchingJobOffers.map(job => job._id);

      if (jobOfferIds.length > 0) {
        query.jobOffer = { $in: jobOfferIds };
      } else {
        return res.status(200).json([]);
      }
    }

    const totalSavedJobs = await SavedJob.countDocuments(query);
    const savedJobs = await SavedJob.find(query)
      .populate({
        path: "jobOffer",
        populate: { path: "categoryId", select: "name subcategories" },
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const savedJobsWithDetails = await Promise.all(
      savedJobs.map(async (savedJob) => {
        const jobOffer = savedJob.jobOffer;
        const category = jobOffer.categoryId;
        const subcategory = category.subcategories.find(
          sub => sub._id.toString() === jobOffer.subcategoryId.toString()
        );

        const company = await Company.findOne({ user: jobOffer.user });

        return {
          id: savedJob._id,
          jobOfferId: jobOffer._id,
          employmentTypeIndex: jobOffer.employmentTypeIndex,
          locationTypeIndex: jobOffer.locationTypeIndex,
          subcategoryName: subcategory ? subcategory.name : "Unknown Subcategory",
          companyName: company ? company.companyName : "Unknown Company",
          companyCountry: company ? company.country : "Unknown Country",
          logoName: company ? `${process.env.BASE_URL}/companylogos/${company.logoName}` : null,
          categoryId: undefined,
          subcategoryId: undefined,
        };
      })
    );

    res.status(200).json({
      savedJobs: savedJobsWithDetails,
      totalPages: Math.ceil(totalSavedJobs / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    next(new ApiError("Server Error", 500));
  }
});



/**
 * @Desc   : Delete a saved job offer by job offer ID
 * @Route  : @Delete /api/saved-jobs/:jobOfferId
 * @Access : Private
 */
exports.deleteSavedJob = asyncHandler(async (req, res, next) => {
    const { user } = req;
    const { jobOfferId } = req.params;
  
    try {
      const savedJob = await SavedJob.findOneAndDelete({
        jobOffer: jobOfferId,
        user: user._id,
      });
  
      if (!savedJob) {
        return next(new ApiError("Saved job not found or not authorized", 404));
      }
  
      res.status(200).json({ message: "Saved job deleted successfully" });
    } catch (error) {
      console.error("Error deleting saved job:", error);
      next(new ApiError("Server Error", 500));
    }
  });


/**
 * @Desc   : Check if a job offer is saved by ID and user
 * @Route  : @Get /api/saved-jobs/:id
 * @Access : Private
 */
exports.getSavedJob = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const savedJob = await SavedJob.findOne({
      jobOffer: id,
      user: user._id,
    }).select("_id");

    if (!savedJob) {
      return res.status(201).json({ error: "Saved job not found" });
    }

    res
      .status(200)
      .json({ message: "Job offer is saved", savedJobId: savedJob._id });
  } catch (error) {
    console.error("Error checking saved job:", error);
    next(new ApiError("Server Error", 500));
  }
});
