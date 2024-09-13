const asyncHandler = require("express-async-handler");
const JobApplication = require("../models/job_application.model");
const ApiError = require("../utils/apiError");
const multer = require("multer");
const path = require("path");
const Company = require("../models/company.model");
const JobOffer = require("../models/jobOffer.model");
const Category = require('../models/jobCategory.model');


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resume");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single("cvUpload");

// @desc    Create a new job application with optional resume upload
// @route   POST /api/job-applications
// @access  Private
exports.createJobApplication = asyncHandler(async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return next(new ApiError(err.message, 400));
    } else if (err) {
      return next(new ApiError("Failed to upload file", 500));
    }

    const { jobId, useProfile, motivationLetter } = req.body;
    const userId = req.user._id;

    // Validate that cvUpload is provided if useProfile is false
    if (!useProfile && !req.file) {
      return next(new ApiError("CV is required when useProfile is false", 400));
    }

    const applicationData = {
      user: userId,
      job: jobId,
      useProfile,
      cvUpload: req.file ? req.file.filename : null,
      motivationLetter,
    };

    const jobApplication = new JobApplication(applicationData);

    await jobApplication.save();

    res.status(201).json({
      success: true,
      data: jobApplication,
    });
  });
});

// @desc    Get applicants for a specific job offer with pagination
// @route   GET /api/applicants/job/:jobOfferId
// @access  Private
exports.getApplicantsForJobOffer = asyncHandler(async (req, res, next) => {
  try {
    const jobOfferId = req.params.jobOfferId;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const skip = (pageNumber - 1) * limitNumber;

    const query = { job: jobOfferId };

    const totalApplicants = await JobApplication.countDocuments(query);

    const applications = await JobApplication.find(query)
      .populate("user", "firstName lastName profileImg")
      .skip(skip)
      .limit(limitNumber)
      .lean();

    if (!applications.length) {
      return res
        .status(404)
        .json({ error: "No applications found for this job offer" });
    }

    const applicationsWithDetails = applications.map((app) => {
      const user = app.user;
      return {
        _id: app._id,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImg: user.profileImg
            ? `${process.env.BASE_URL}/userimg/${user.profileImg}`
            : null,
        },
        job: app.job,
        useProfile: app.useProfile,
        cvUpload: app.cvUpload
          ? `${process.env.BASE_URL}/resume/${app.cvUpload}`
          : null,
        motivationLetter: app.motivationLetter,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    });

    res.status(200).json({
      totalApplicants,
      totalPages: Math.ceil(totalApplicants / limitNumber),
      currentPage: pageNumber,
      application: applicationsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching applicants for job offer:", error);
    next(new ApiError("Server Error", 500));
  }
});


/**
 * @desc    Update the status of a job application
 * @route   PATCH /api/job-applications/:jobApplicationId
 * @access  Private
 */
exports.updateJobApplicationStatus = asyncHandler(async (req, res, next) => {
  const { jobApplicationId } = req.params;
  const { status } = req.body;

  const validStatuses = ['sent', 'pending', 'rejected', 'accepted'];
  if (!validStatuses.includes(status)) {
    return next(new ApiError('Invalid status value', 400));
  }

  try {
    // Find and update the job application
    const jobApplication = await JobApplication.findByIdAndUpdate(
      jobApplicationId,
      { status },
      { new: true }
    );

    if (!jobApplication) {
      return next(new ApiError('Job application not found', 404));
    }

    res.status(200).json({
      success: true,
      data: jobApplication,
    });
  } catch (error) {
    console.error('Error updating job application status:', error);
    next(new ApiError('Server Error', 500));
  }
});





/**
 * @Desc   : Get all job applications for the logged-in user with pagination and search
 * @Route  : @Get /api/job-applications
 * @Access : Private
 */
exports.getJobApplications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const { user } = req;

  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;

  let query = { user: user._id };

  try {
    if (search) {
      // Find matching companies by name
      const matchingCompanies = await Company.find({
        companyName: { $regex: search, $options: "i" },
      }).select("_id user");

      const userIds = matchingCompanies.map((company) => company.user);

      // Find matching job offers by subcategory name or company user IDs
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
          { user: { $in: userIds } },
        ],
      }).select("_id");

      const jobOfferIds = matchingJobOffers.map((job) => job._id);

      if (jobOfferIds.length > 0) {
        query.job = { $in: jobOfferIds };
      } else {
        return res.status(200).json({
          jobApplications: [],
          totalPages: 0,
          currentPage: pageNumber,
        });
      }
    }

    const totalJobApplications = await JobApplication.countDocuments(query);
    const jobApplications = await JobApplication.find(query)
      .populate({
        path: "job",
        populate: { path: "categoryId", select: "name subcategories" },
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const applicationsWithDetails = await Promise.all(
      jobApplications.map(async (application) => {
        const jobOffer = application.job;
        const category = jobOffer.categoryId;
        const subcategory = category.subcategories.find(
          (sub) => sub._id.toString() === jobOffer.subcategoryId.toString()
        );

        const company = await Company.findOne({ user: jobOffer.user });

        return {
          id: application._id,
          jobOfferId: jobOffer._id,
          subcategoryName: subcategory ? subcategory.name : "Unknown Subcategory",
          companyName: company ? company.companyName : "Unknown Company",
          applicationStatus: application.status,
          logoName: company
            ? `${process.env.BASE_URL}/companylogos/${company.logoName}`
            : null,
          createdAt: application.createdAt,
        };
      })
    );

    res.status(200).json({
      jobApplications: applicationsWithDetails,
      totalPages: Math.ceil(totalJobApplications / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    next(new ApiError("Server Error", 500));
  }
});