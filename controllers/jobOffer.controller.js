const asyncHandler = require("express-async-handler");
const JobOffer = require("../models/jobOffer.model");
const Company = require("../models/company.model");
const Category = require("../models/jobCategory.model");
const ApiError = require("../utils/apiError");
const SavedJob = require("../models/saveJob.model");
const JobApplication = require("../models/job_application.model");

/**
 * @Desc   : Create a job offer
 * @Route  : @Post /api/job-offers
 * @Access : Private
 */

exports.createJobOffer = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const {
    subcategoryId,
    employmentTypeIndex,
    locationTypeIndex,
    jobDescription,
    minimumQualifications,
    requiredSkills,
    categoryId,
  } = req.body;

  const company = await Company.findOne({ user: user._id });
  if (!company) {
    return next(new ApiError("User has no associated company", 400));
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new ApiError("Invalid category ID", 400));
  }

  const subcategory = category.subcategories.find(
    (sub) => sub._id.toString() === subcategoryId
  );
  if (!subcategory) {
    return next(new ApiError("Invalid subcategory ID", 400));
  }

  const jobOffer = new JobOffer({
    user: user._id,
    subcategoryId,
    categoryId,
    employmentTypeIndex,
    locationTypeIndex,
    jobDescription,
    minimumQualifications,
    requiredSkills,
  });

  await jobOffer.save();
  res.status(201).json(jobOffer);
});

/**
 * @Desc   : Update a job offer
 * @Route  : @Put /api/job-offers/:id
 * @Access : Private
 */
exports.updateJobOffer = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  const updateData = req.body;

  const jobOffer = await JobOffer.findOne({ _id: id, user: user._id });
  if (!jobOffer) {
    return next(new ApiError("Job offer not found or not authorized", 404));
  }


  // Validate categoryId if it is being updated
  if (updateData.categoryId) {
    console.log(updateData.categoryId);

    const category = await Category.findById(updateData.categoryId);
    if (!category) {
      return next(new ApiError("Invalid category ID", 400));
    }

    // Validate subcategoryId if it is being updated
    if (updateData.subcategoryId) {
      const subcategory = category.subcategories.find(
        (sub) => sub._id.toString() === updateData.subcategoryId
      );
      if (!subcategory) {
        return next(new ApiError("Invalid subcategory ID", 400));
      }
    }
  }

  Object.assign(jobOffer, updateData);
  await jobOffer.save();

  res.status(200).json(jobOffer);
});

/**
 * @Desc   : Delete a job offer
 * @Route  : @Delete /api/job-offers/:id
 * @Access : Private
 */
exports.deleteJobOffer = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  try {
    console.log("Deleting job offer with ID:", id);

    // Check if the job offer exists
    const jobOffer = await JobOffer.findOne({ _id: id, user: user._id });
    if (!jobOffer) {
      console.warn(`JobOffer not found or not authorized for ID: ${id}`);
      return next(new ApiError("Job offer not found or not authorized", 404));
    }

    console.log("JobOffer found:", jobOffer);

    // Delete related SavedJobs
    const deletedSavedJobs = await SavedJob.deleteMany({ jobOffer: id });
    console.log(`Deleted SavedJobs: ${deletedSavedJobs.deletedCount}`);

    // Delete related JobApplications
    const deletedJobApplications = await JobApplication.deleteMany({ job: id });
    console.log(`Deleted JobApplications: ${deletedJobApplications.deletedCount}`);

    // Finally, delete the job offer
    await jobOffer.deleteOne();
    console.log("JobOffer deleted successfully.");

    // Respond with the details of deleted items
    res.status(200).json({
      message: "Job offer deleted successfully",
      details: {
        deletedSavedJobs: deletedSavedJobs.deletedCount,
        deletedJobApplications: deletedJobApplications.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting job offer:", error);
    return next(new ApiError("Server error occurred while deleting job offer", 500));
  }
});



/**
 * @Desc   : Get all job offers with pagination, search, and filtering, default sorting by applicantCount and createdAt
 * @Route  : GET /api/job-offers
 * @Access : Private
 */
exports.getJobOffers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = "", filter = "0" } = req.query;
  const { user } = req;

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  let query = { user: user._id };

  if (filter === "1") {
    query.active = true;
  } else if (filter === "2") {
    query.active = false;
  }

  try {
    if (search) {
      const matchingCategories = await Category.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "subcategories.name": { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const categoryIds = matchingCategories.map((cat) => cat._id);

      if (categoryIds.length > 0) {
        query.categoryId = { $in: categoryIds };
      } else {
        query.categoryId = null;
      }
    }

    const jobOffers = await JobOffer.find(query)
      .populate("categoryId", "name subcategories")
      .lean();

    // Get the applicant count for each job offer
    const jobOfferIds = jobOffers.map((job) => job._id);
    const applicantCounts = await JobApplication.aggregate([
      { $match: { job: { $in: jobOfferIds }, status: "sent" } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);

    // Map the applicant counts to the respective job offers, defaulting to 0 if no applicants
    const jobOffersWithDetails = jobOffers.map((job) => {
      const category = job.categoryId;
      const subcategory = category.subcategories.find(
        (sub) => sub._id.toString() === job.subcategoryId.toString()
      );
      const applicantCount =
        applicantCounts.find(
          (count) => count._id.toString() === job._id.toString()
        )?.count || 0;

      return {
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory ? subcategory.name : "Unknown Subcategory",
        categoryId: undefined,
        applicantCount,
      };
    });

    // Sort by applicantCount (desc), then createdAt (desc)
    jobOffersWithDetails.sort((a, b) => {
      if (b.applicantCount === a.applicantCount) {
        return new Date(b.createdAt) - new Date(a.createdAt); // Secondary sort by createdAt
      }
      return b.applicantCount - a.applicantCount; // Primary sort by applicantCount
    });

    // Paginate the sorted results
    const paginatedJobOffers = jobOffersWithDetails.slice(
      (pageNumber - 1) * limitNumber,
      pageNumber * limitNumber
    );

    const totalCount = await JobOffer.countDocuments(query);
    const company = await Company.findOne({ user: user._id });

    res.json({
      jobOffers: paginatedJobOffers,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      company,
    });
  } catch (error) {
    console.error("Error fetching job offers:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

/**
 * @Desc   : Get a single job offer by ID
 * @Route  : @Get /api/job-offers/:id
 * @Access : Private
 */
exports.getJobOffer = asyncHandler(async (req, res, next) => {
  try {
    const jobOfferId = req.params.id;
    const userId = req.user._id;

    const jobOffer = await JobOffer.findById(jobOfferId).populate(
      "categoryId",
      "name subcategories"
    );

    if (!jobOffer) {
      return res.status(404).json({ error: "Job offer not found" });
    }

    const category = jobOffer.categoryId;
    const subcategory = category.subcategories.find(
      (sub) => sub._id.toString() === jobOffer.subcategoryId.toString()
    );

    const company = await Company.findOne({ user: jobOffer.user });
    const jobApplication = await JobApplication.findOne({
      user: userId,
      job: jobOfferId,
    });
    const jobOfferWithDetails = {
      ...jobOffer._doc,
      subcategoryName: subcategory ? subcategory.name : "Unknown Subcategory",
      companyName: company ? company.companyName : "Unknown Company",
      companyCountry: company ? company.country : "Unknown Country",
      companyAbout: company ? company.aboutCompany : "Unknown About",
      applicationStatus: jobApplication ? jobApplication.status : "Not Applied",
      logoName: company
        ? `${process.env.BASE_URL}/companylogos/${company.logoName}`
        : null,
      categoryId: subcategory.id,
      subcategoryId: category.id,
    };

    res.status(200).json(jobOfferWithDetails);
  } catch (error) {
    console.error("Error fetching job offer:", error);
    next(new ApiError("Server Error", 500));
  }
});

/**
 * @Desc   : Toggle a job offer's active status
 * @Route  : @Patch /api/job-offers/:id/active
 * @Access : Private
 */
exports.toggleJobOfferActive = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  // Find the job offer associated with the user
  const jobOffer = await JobOffer.findOne({ _id: id, user: user._id });
  if (!jobOffer) {
    return next(new ApiError("Job offer not found or not authorized", 404));
  }

  // Toggle the active status
  jobOffer.active = !jobOffer.active;
  await jobOffer.save();

  res.status(200).json(jobOffer);
});

/**
 * @Desc   : Get the most recently added job offers with company name and country
 * @Route  : @Get /api/job-offers/recent
 * @Access : Public
 */
exports.getRecentJobOffersAdded = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  try {
    const totalJobOffers = await JobOffer.countDocuments();
    const recentJobOffers = await JobOffer.find({ active: true })
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("categoryId", "name subcategories");

    const jobOffersWithNames = await Promise.all(
      recentJobOffers.map(async (jobOffer) => {
        const category = jobOffer.categoryId;
        const subcategory = category.subcategories.find(
          (sub) => sub._id.toString() === jobOffer.subcategoryId.toString()
        );

        const company = await Company.findOne({ user: jobOffer.user });

        return {
          id: jobOffer._id,
          employmentTypeIndex: jobOffer.employmentTypeIndex,
          locationTypeIndex: jobOffer.locationTypeIndex,
          subcategoryName: subcategory
            ? subcategory.name
            : "Unknown Subcategory",
          companyName: company ? company.companyName : "Unknown Company",
          companyCountry: company ? company.country : "Unknown Country",
          logoName: company
            ? `${process.env.BASE_URL}/companylogos/${company.logoName}`
            : null,
          categoryId: undefined,
          subcategoryId: undefined,
        };
      })
    );

    res.status(200).json({
      jobOffers: jobOffersWithNames,
      totalPages: Math.ceil(totalJobOffers / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching recent job offers:", error);
    next(new ApiError("Server Error", 500));
  }
});
