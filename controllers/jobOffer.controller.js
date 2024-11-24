const asyncHandler = require("express-async-handler");
const JobOffer = require("../models/jobOffer.model");
const Company = require("../models/company.model");
const Category = require("../models/jobCategory.model");
const JobApplication = require("../models/job_application.model");
const ApiError = require("../utils/apiError");

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

  const jobOffer = await JobOffer.findOneAndDelete({ _id: id, user: user._id });
  if (!jobOffer) {
    return next(new ApiError("Job offer not found or not authorized", 404));
  }

  res.status(200).json({ message: "Job offer deleted successfully" });
});



/**
 * @Desc   : Get all job offers with pagination, search, and filtering
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
      .sort({ createdAt: -1 }) // Sort by createdAt descending
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean(); // Using lean() to get plain JavaScript objects

    // Get the applicant count for each job offer, including those with zero applicants
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
      const applicantCount = applicantCounts.find(
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

    const totalCount = await JobOffer.countDocuments(query);
    const company = await Company.findOne({ user: user._id });

    res.json({
      jobOffers: jobOffersWithDetails,
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
      categoryId: undefined,
      subcategoryId: undefined,
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
  const { page = 1, limit = 6 } = req.query;

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  try {
    const totalJobOffers = await JobOffer.countDocuments();
    const recentJobOffers = await JobOffer.find({active : true})
      .sort({ createdAt: -1 })
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

