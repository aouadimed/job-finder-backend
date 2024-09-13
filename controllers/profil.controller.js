const asyncHandler = require('express-async-handler');
const ContactInfo = require('../models/contact_info.model');
const Summary = require('../models/summary.model');
const WorkExperience = require('../models/work_experience.model');
const Education = require('../models/education.model');
const Skill = require('../models/skill.model');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

const SECTION_WEIGHTS = {
  CONTACT_INFO: 20,
  SUMMARY: 10,
  WORK_EXPERIENCE: 25,
  EDUCATION: 20,
  SKILL: 5, // Each skill adds 5%, max 25% for 5 skills
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

    // Check for missing sections and prepare error messages
    const { missingSections, errors } = checkMissingSections({
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

    // Always return 200 but include error messages if any sections are missing
    if (missingSections.length > 0) {
      return res.status(200).json({
        completionPercentage,
        errors, // Array of error messages for missing sections
        message: 'Some sections are incomplete. Please fill in the missing sections.',
      });
    }

    // If no sections are missing, return the completion percentage with a success message
    res.status(200).json({
      completionPercentage,
      message: 'CV is fully completed.',
    });
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

// Helper function to check for missing sections and return appropriate error messages
function checkMissingSections({ contactInfo, summary, workExperiences, educations, skills, user }) {
  const missingSections = [];
  const errors = [];

  // Check for contact info in either ContactInfo or User model
  if (!contactInfo && (!user.email || !user.phone || !user.address)) {
    missingSections.push('Contact Info');
    errors.push('Contact Info is incomplete. Please provide email, phone, and address.');
  }
  if (!summary) {
    missingSections.push('Summary');
    errors.push('Summary section is missing.');
  }
  if (workExperiences.length === 0) {
    missingSections.push('Work Experience');
    errors.push('Work Experience section is missing.');
  }
  if (educations.length === 0) {
    missingSections.push('Education');
    errors.push('Education section is missing.');
  }
  if (skills.length < 5) {
    missingSections.push('Skills (Minimum 5 required)');
    errors.push('At least 5 skills are required.');
  }

  return { missingSections, errors };
}
