const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const User = require("../models/user.model");

// @Desc : make sure that user is logged in
exports.requireLogin = asyncHandler(async (req, res, next) => {
  // * check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError(
        "your are not logged in, please login to get access this route",
        401
      )
    );
  }
  // * Verify Token (no change happens , expire token)
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // * check if user exist
  const currentUser = await User.findById(decodedToken.userId);
  if (!currentUser) {
    return next(
      new ApiError("the user of this token does no longer exist", 401)
    );
  }
  // * Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamps = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // Password changed after token was created || Error
    if (passwordChangedTimestamps > decodedToken.iat) {
      return next(
        new ApiError(
          "User recently changed his password , please Login again ! ",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route !", 403)
      );
    }
    next();
  });

exports.assignUserIdToBody = (req, res, next) => {
  req.body.user = req.user._id;
  next();
};
