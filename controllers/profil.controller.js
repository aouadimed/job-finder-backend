const asyncHandler = require('express-async-handler');
const ContactInfo = require('../models/contact_info.model');
const Summary = require('../models/summary.model');
const WorkExperience = require('../models/work_experience.model');
const Education = require('../models/education.model');
const Skill = require('../models/skill.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

// Dynamic weights for CV sections
const SECTION_WEIGHTS = {
  CONTACT_INFO: 20,
  SUMMARY: 10,
  WORK_EXPERIENCE: 25,
  EDUCATION: 20,
  SKILL: 5, // Weight each skill slightly lower to encourage multiple entries
};

// @desc    Calculate CV Completion Percentage
// @route   GET /api/cv-completion
// @access  Private
exports.calculateCVCompletion = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all required data in parallel
    const [contactInfo, summary, workExperiences, educations, skills, user] = await Promise.all([
      ContactInfo.findOne({ user: userId }),
      Summary.findOne({ user: userId }),
      WorkExperience.find({ user: userId }),
      Education.find({ user: userId }),
      Skill.find({ user: userId }),
      User.findById(userId).select('email phone address'),
    ]);

    // Check for missing sections and their corresponding status codes
    const { missingSections, statusCodes } = checkMissingSections({
      contactInfo,
      summary,
      workExperiences,
      educations,
      skills,
      user,
    });

    // Calculate the completion percentage
    const completionPercentage = calculateCompletion({
      contactInfo: contactInfo || user, // Use user info if contactInfo is missing
      summary,
      workExperiences,
      educations,
      skills,
    });

    if (missingSections.length > 0) {
      // If there are missing sections, return the first status code
      return res.status(statusCodes[0]).json({ completionPercentage });
    } else {
      // If no sections are missing, return the completion percentage with a 200 status
      res.status(200).json({ completionPercentage });
    }
  } catch (error) {
    return next(new ApiError('Failed to calculate CV completion', 500));
  }
});

// Helper function to calculate the completion percentage
function calculateCompletion({ contactInfo, summary, workExperiences, educations, skills }) {
  let completion = 0;

  if (contactInfo) completion += SECTION_WEIGHTS.CONTACT_INFO;
  if (summary) completion += SECTION_WEIGHTS.SUMMARY;
  if (workExperiences.length > 0) completion += SECTION_WEIGHTS.WORK_EXPERIENCE;
  if (educations.length > 0) completion += SECTION_WEIGHTS.EDUCATION;
  completion += Math.min(skills.length * SECTION_WEIGHTS.SKILL, 25); // Capped at 25% for 5 skills

  return completion;
}

// Helper function to check for missing sections and return appropriate status codes
function checkMissingSections({ contactInfo, summary, workExperiences, educations, skills, user }) {
  const missingSections = [];
  const statusCodes = [];

  // Check for contact info in either ContactInfo or User model
  if (!contactInfo && (!user.email || !user.phone || !user.address)) {
    missingSections.push('Contact Info');
    statusCodes.push(400); // Bad Request: Contact Info is missing
  }
  if (!summary) {
    missingSections.push('Summary');
    statusCodes.push(401); // Unauthorized: Summary is missing
  }
  if (workExperiences.length === 0) {
    missingSections.push('Work Experience');
    statusCodes.push(402); // Payment Required: Work Experience is missing
  }
  if (educations.length === 0) {
    missingSections.push('Education');
    statusCodes.push(403); // Forbidden: Education is missing
  }
  if (skills.length < 5) {
    missingSections.push('Skills (Minimum 5 required)');
    statusCodes.push(422); // Unprocessable Entity: Not enough skills
  }

  return { missingSections, statusCodes };
}
