const asyncHandler = require('express-async-handler');
const Skill = require('../models/skill.model');
const ApiError = require('../utils/apiError');

// @desc    Add a new skill
// @route   POST /api/skills
// @access  Private
exports.createSkill = asyncHandler(async (req, res, next) => {
  try {
    const { skill } = req.body;
    const userId = req.user._id;

    const newSkill = new Skill({
      user: userId,
      skill,
    });

    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    return next(new ApiError('Failed to add skill', 500));
  }
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
exports.deleteSkill = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const skillId = req.params.id;

    const skill = await Skill.findOneAndDelete({
      _id: skillId,
      user: userId,
    });

    if (!skill) {
      return next(new ApiError('Skill not found', 404));
    }

    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    return next(new ApiError('Failed to delete skill', 500));
  }
});

// @desc    Get all skills for a user
// @route   GET /api/skills
// @access  Private
exports.getSkills = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const skills = await Skill.find({ user: userId });

    res.status(200).json(skills);
  } catch (error) {
    return next(new ApiError('Failed to fetch skills', 500));
  }
});
