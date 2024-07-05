const asyncHandler = require("express-async-handler");
const Language = require("../models/language.model");
const ApiError = require("../utils/apiError");

// @desc    Create a new language entry
// @route   POST /api/languages
// @access  Private
exports.createLanguage = asyncHandler(async (req, res, next) => {
  try {
    const { language, proficiencyIndex } = req.body;
    const userId = req.user._id;

    const languageEntry = new Language({
      user: userId,
      language,
      proficiencyIndex,
    });

    await languageEntry.save();
    res.status(201).json(languageEntry);
  } catch (error) {
    return next(new ApiError("Failed to create language entry", 500));
  }
});

// @desc    Get all languages of a user
// @route   GET /api/languages
// @access  Private
exports.getLanguages = asyncHandler(async (req, res, next) => {
  try {
    const languages = await Language.find({ user: req.user._id });

    res.status(200).json(languages);
  } catch (error) {
    return next(new ApiError("Failed to get languages", 500));
  }
});

// @desc    Get a single language entry
// @route   GET /api/languages/:id
// @access  Private
exports.getLanguage = asyncHandler(async (req, res, next) => {
  try {
    const languageEntry = await Language.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!languageEntry) {
      return next(new ApiError("Language entry not found", 404));
    }

    res.status(200).json(languageEntry);
  } catch (error) {
    return next(new ApiError("Failed to get language entry", 500));
  }
});

// @desc    Update a language entry
// @route   PUT /api/languages/:id
// @access  Private
exports.updateLanguage = asyncHandler(async (req, res, next) => {
  try {
    const { language, proficiencyIndex } = req.body;
    const userId = req.user._id;

    const languageEntry = await Language.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { language, proficiencyIndex },
      { new: true }
    );

    if (!languageEntry) {
      return next(new ApiError("Language entry not found", 404));
    }

    res.status(200).json(languageEntry);
  } catch (error) {
    return next(new ApiError("Failed to update language entry", 500));
  }
});

// @desc    Delete a language entry
// @route   DELETE /api/languages/:id
// @access  Private
exports.deleteLanguage = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    const languageEntry = await Language.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!languageEntry) {
      return next(new ApiError("Language entry not found", 404));
    }

    res.status(200).json({ message: "Language entry deleted successfully" });
  } catch (error) {
    return next(new ApiError("Failed to delete language entry", 500));
  }
});
