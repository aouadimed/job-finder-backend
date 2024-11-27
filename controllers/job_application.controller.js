const asyncHandler = require("express-async-handler");
const JobApplication = require("../models/job_application.model");
const ApiError = require("../utils/apiError");
const multer = require("multer");
const path = require("path");
const Company = require("../models/company.model");
const JobOffer = require("../models/jobOffer.model");
const Category = require("../models/jobCategory.model");
const ContactInfo = require("../models/contact_info.model");
const Education = require("../models/education.model");
const Language = require("../models/language.model");
const Project = require("../models/project.model");
const Skill = require("../models/skill.model");
const Summary = require("../models/summary.model");
const WorkExperience = require("../models/work_experience.model");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
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

/**
 * @Desc   : Get applicants for a specific job offer with pagination and detailed profiles
 * @Route  : GET /api/applicants/job/:jobOfferId
 * @Access : Private
 */
exports.getApplicantsForJobOffer = asyncHandler(async (req, res, next) => {
  try {
    const jobOfferId = req.params.jobOfferId;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const query = { job: jobOfferId , status: "sent"};

    const totalApplicants = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .populate("user", "firstName lastName profileImg email phone address")
      .skip(skip)
      .limit(limitNumber)
      .lean();

 

    // Fetch additional profile details if useProfile is true
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const user = app.user;

        if (app.useProfile) {
          const [
            contactInfo,
            education,
            languages,
            projects,
            skills,
            summary,
            workExperience,
          ] = await Promise.all([
            ContactInfo.findOne({ user: user._id }).lean(),
            Education.find({ user: user._id }).lean(),
            Language.find({ user: user._id }).lean(),
            Project.find({ user: user._id }).lean(),
            Skill.find({ user: user._id }).lean(),
            Summary.findOne({ user: user._id }).lean(),
            WorkExperience.find({ user: user._id }).lean(),
          ]);

          // Use contactInfo if available, otherwise fallback to user details
          const contactDetails = contactInfo || {
            email: user.email,
            phone: user.phone,
            address: user.address,
          };

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
            profileDetails: {
              contactInfo: contactDetails,
              education,
              languages,
              projects,
              skills,
              summary,
              workExperience,
              name: `${user.firstName} ${user.lastName}`,
              profileImg: user.profileImg
                ? `${process.env.BASE_URL}/userimg/${user.profileImg}`
                : null,
            },
          };
        } else {
          // If useProfile is false, return without profile details
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
        }
      })
    );

    res.status(200).json({
      totalApplicants,
      totalPages: Math.ceil(totalApplicants / limitNumber),
      currentPage: pageNumber,
      applications: applicationsWithDetails,
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

  const validStatuses = ["sent", "pending", "rejected", "accepted"];
  if (!validStatuses.includes(status)) {
    return next(new ApiError("Invalid status value", 400));
  }

  try {
    // Find and update the job application
    const jobApplication = await JobApplication.findByIdAndUpdate(
      jobApplicationId,
      { status },
      { new: true }
    );

    if (!jobApplication) {
      return next(new ApiError("Job application not found", 404));
    }

    res.status(200).json({
      success: true,
      data: jobApplication,
    });
  } catch (error) {
    console.error("Error updating job application status:", error);
    next(new ApiError("Server Error", 500));
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
        "subcategories.name": { $regex: search, $options: "i" },
      }).select("_id subcategories");

      const subcategoryIds = [];
      matchingCategories.forEach((category) => {
        category.subcategories.forEach((subcategory) => {
          if (subcategory.name.match(new RegExp(search, "i"))) {
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
    .sort( {createdAt: -1})
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
          subcategoryName: subcategory
            ? subcategory.name
            : "Unknown Subcategory",
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

/**
 * @Desc   : Notify applicant about application review
 * @Route  : POST /api/job-applications/:jobApplicationId/notify-review
 * @Access : Private (for company or admin users)
 */
exports.notifyApplicantReview = asyncHandler(async (req, res, next) => {
  const { jobApplicationId } = req.params;

  try {
    // Retrieve the job application, job offer, and applicant information
    const jobApplication = await JobApplication.findById(
      jobApplicationId
    ).populate("user job");
    if (!jobApplication)
      return next(new ApiError("Job application not found", 404));

    const jobOffer = await JobOffer.findById(jobApplication.job).populate(
      "user categoryId"
    );
    if (!jobOffer) return next(new ApiError("Job offer not found", 404));

    const applicant = await User.findById(jobApplication.user);
    if (!applicant) return next(new ApiError("Applicant not found", 404));

    // Check if category and subcategories exist
    const category = jobOffer.categoryId;
    const subcategory = category?.subcategories?.find(
      (sub) => sub._id.toString() === jobOffer.subcategoryId.toString()
    );

    const company = await Company.findOne({ user: jobOffer.user });

    // Compose the professional message
    const messageContent = `
      Hello ${applicant.firstName},

      We have reviewed your application for the position of "${
        subcategory ? subcategory.name : "Unknown Position"
      }" at our company. Your background and experience have impressed us, and we would love to discuss this role with you in more detail.

      Please let us know if you're available to set up a time to chat. We look forward to connecting with you soon.

      Best regards,
      ${jobOffer.user.firstName} ${jobOffer.user.lastName} from ${
      company.companyName || "our company"
    }
    `;

    // Find or create a chat between the applicant and the company
    let chat = await Chat.findOne({
      users: { $all: [req.user._id, applicant._id] },
    });
    if (!chat) {
      chat = await Chat.create({ users: [req.user._id, applicant._id] });
    }

    // Send the message
    const message = await Message.create({
      sender: req.user._id,
      receiver: applicant._id,
      content: messageContent,
      chat: chat._id,
      readBy: [req.user._id], // Automatically mark as read by the sender
    });

    res.status(200).json({
      success: true,
      message: "Notification sent to applicant successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error notifying applicant about review:", error);
    next(new ApiError("Server Error", 500));
  }
});

/**
 * @Desc   : Get recent applicants for all job offers created by a recruiter
 * @Route  : GET /api/job-applications/recent
 * @Access : Private (Recruiter Only)
 */
exports.getRecentApplicants = asyncHandler(async (req, res, next) => {
  try {
    const recruiterId = req.user._id; // Assuming `req.user` contains the authenticated recruiter's details
    const { page = 1, limit = 5, search } = req.query; // Include `search` from query parameters

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch all job offers created by this recruiter
    const jobOffers = await JobOffer.find({ user: recruiterId })
      .populate("categoryId", "name subcategories") // Populate category details
      .select("_id categoryId subcategoryId"); // Include only relevant fields

    const jobOfferIds = jobOffers.map((offer) => offer._id);

    if (jobOfferIds.length === 0) {
      return res.status(200).json({
        totalApplicants: 0,
        totalPages: 0,
        currentPage: pageNumber,
        applications: [],
      });
    }

    // Base query for applications
    const query = { status: "sent", job: { $in: jobOfferIds } };

    const totalApplicants = await JobApplication.countDocuments(query);

    const applications = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName profileImg email phone address") // Populate user details
      .lean(); // Fetch all records without pagination to filter in-app

    // Enhance application details
    let applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const user = app.user;

        // Find the corresponding job offer to get category and subcategory details
        const jobOffer = jobOffers.find(
          (offer) => offer._id.toString() === app.job.toString()
        );

        if (!jobOffer) return null; // Skip if no jobOffer is found (unlikely)

        const category = jobOffer.categoryId;
        const subcategory = category?.subcategories?.find(
          (sub) => sub._id.toString() === jobOffer.subcategoryId.toString()
        );

        const jobTitle = subcategory?.name || "Unknown Title";

        if (app.useProfile) {
          const [
            contactInfo,
            education,
            languages,
            projects,
            skills,
            summary,
            workExperience,
          ] = await Promise.all([
            ContactInfo.findOne({ user: user._id }).lean(),
            Education.find({ user: user._id }).lean(),
            Language.find({ user: user._id }).lean(),
            Project.find({ user: user._id }).lean(),
            Skill.find({ user: user._id }).lean(),
            Summary.findOne({ user: user._id }).lean(),
            WorkExperience.find({ user: user._id }).lean(),
          ]);

          const contactDetails = contactInfo || {
            email: user.email,
            phone: user.phone,
            address: user.address,
          };

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
            job: jobTitle,
            useProfile: app.useProfile,
            cvUpload: app.cvUpload
              ? `${process.env.BASE_URL}/resume/${app.cvUpload}`
              : null,
            motivationLetter: app.motivationLetter,
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            profileDetails: {
              contactInfo: contactDetails,
              education,
              languages,
              projects,
              skills,
              summary,
              workExperience,
              name: `${user.firstName} ${user.lastName}`,
              profileImg: user.profileImg
                ? `${process.env.BASE_URL}/userimg/${user.profileImg}`
                : null,
            },
          };
        } else {
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
            job: jobTitle,
            useProfile: app.useProfile,
            cvUpload: app.cvUpload
              ? `${process.env.BASE_URL}/resume/${app.cvUpload}`
              : null,
            motivationLetter: app.motivationLetter,
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
          };
        }
      })
    );

    // Filter applications based on the search term
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      applicationsWithDetails = applicationsWithDetails.filter((app) => {
        const user = app.user;
        return (
          searchRegex.test(user.firstName) ||
          searchRegex.test(user.lastName) ||
          searchRegex.test(app.job)
        );
      });
    }

    // Paginate the filtered results
    const paginatedApplications = applicationsWithDetails.slice(
      skip,
      skip + limitNumber
    );

    res.status(200).json({
      totalApplicants: applicationsWithDetails.length,
      totalPages: Math.ceil(applicationsWithDetails.length / limitNumber),
      currentPage: pageNumber,
      applications: paginatedApplications,
    });
  } catch (error) {
    console.error("Error fetching recent applicants:", error);
    next(new ApiError("Server Error", 500));
  }
});
