const asyncHandler = require("express-async-handler");
const SavedJob = require("../models/saveJob.model");
const JobOffer = require("../models/jobOffer.model");
const ApiError = require("../utils/apiError");

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
 * @Desc   : Get all saved job offers for the logged-in user
 * @Route  : @Get /api/saved-jobs
 * @Access : Private
 */
exports.getSavedJobs = asyncHandler(async (req, res, next) => {
  const { user } = req;

  const savedJobs = await SavedJob.find({ user: user._id }).populate({
    path: "jobOffer",
    populate: { path: "categoryId", select: "name subcategories" },
  });

  const savedJobsWithDetails = await Promise.all(
    savedJobs.map(async (savedJob) => {
      const jobOffer = savedJob.jobOffer;
      const category = jobOffer.categoryId;
      const subcategory = category.subcategories.find(
        (sub) => sub._id.toString() === jobOffer.subcategoryId.toString()
      );

      return {
        id: savedJob._id,
        jobOfferId: jobOffer._id,
        employmentTypeIndex: jobOffer.employmentTypeIndex,
        locationTypeIndex: jobOffer.locationTypeIndex,
        subcategoryName: subcategory ? subcategory.name : "Unknown Subcategory",
        companyName: jobOffer.companyName,
        companyCountry: jobOffer.companyCountry,
        logoName: jobOffer.logoName,
        categoryId: undefined,
        subcategoryId: undefined,
      };
    })
  );

  res.status(200).json(savedJobsWithDetails);
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
