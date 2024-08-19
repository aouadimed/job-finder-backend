const asyncHandler = require("express-async-handler");
const JobApplication = require("../models/job_application.model");
const ApiError = require("../utils/apiError");
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/resume');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }).single('cvUpload');

// @desc    Create a new job application with optional resume upload
// @route   POST /api/job-applications
// @access  Private
exports.createJobApplication = asyncHandler(async (req, res, next) => {
  upload(req, res, async function(err) {
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
      .populate('user', 'firstName lastName profileImg')
      .skip(skip)
      .limit(limitNumber)
      .lean();

    if (!applications.length) {
      return res.status(404).json({ error: 'No applications found for this job offer' });
    }

    const applicationsWithDetails = applications.map(app => {
      const user = app.user;
      return {
        _id: app._id,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImg: user.profileImg ? `${process.env.BASE_URL}/userimg/${user.profileImg}` : null,
        },
        job: app.job,
        useProfile: app.useProfile,
        cvUpload: app.cvUpload ? `${process.env.BASE_URL}/resume/${app.cvUpload}`: null,
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
      application :applicationsWithDetails,
    });
  } catch (error) {
    console.error('Error fetching applicants for job offer:', error);
    next(new ApiError('Server Error', 500));
  }
});
