const asyncHandler = require("express-async-handler");
const OrganizationActivity = require("../models/organization_activity.model");
const ApiError = require("../utils/apiError");

// @desc    Create a new organization activity
// @route   POST /api/organization_activity/create
// @access  Private
exports.createOrganizationActivity = asyncHandler(async (req, res, next) => {
  const {
    organization,
    role,
    startDate,
    endDate,
    description,
    stillMember,
  } = req.body;
  const userId = req.user._id;

  const activity = new OrganizationActivity({
    user: userId,
    organization,
    role,
    startDate,
    endDate,
    description,
    stillMember,
  });

  await activity.save();
  res.status(201).json(activity);
});

// @desc    Get all organization activities of a user
// @route   GET /api/organization_activity/activities
// @access  Private
exports.getAllOrganizationActivities = asyncHandler(async (req, res, next) => {
  const activities = await OrganizationActivity.find({ user: req.user._id });

  res.status(200).json(activities);
});

// @desc    Get a single organization activity
// @route   GET /api/organization_activity/activity/:id
// @access  Private
exports.getOrganizationActivity = asyncHandler(async (req, res, next) => {
  const activity = await OrganizationActivity.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!activity) {
    return next(new ApiError("Organization activity not found", 404));
  }

  res.status(200).json(activity);
});

// @desc    Update an organization activity
// @route   PUT /api/organization_activity/update/:id
// @access  Private
exports.updateOrganizationActivity = asyncHandler(async (req, res, next) => {
  const {
    organization,
    role,
    startDate,
    endDate,
    description,
    stillMember,
  } = req.body;
  const userId = req.user._id;

  const activity = await OrganizationActivity.findOneAndUpdate(
    { _id: req.params.id, user: userId },
    {
      organization,
      role,
      startDate,
      endDate,
      description,
      stillMember,
    },
    { new: true }
  );

  if (!activity) {
    return next(new ApiError("Organization activity not found", 404));
  }

  res.status(200).json(activity);
});

// @desc    Delete an organization activity
// @route   DELETE /api/organization_activity/delete/:id
// @access  Private
exports.deleteOrganizationActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const activity = await OrganizationActivity.findOneAndDelete({
    _id: req.params.id,
    user: userId,
  });

  if (!activity) {
    return next(new ApiError("Organization activity not found", 404));
  }

  res.status(200).json({ message: "Organization activity deleted successfully" });
});
