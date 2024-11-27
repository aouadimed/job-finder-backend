const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/apiError");
const User = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const { resetCodeContent } = require("../template/resetCode");

// Configure multer for temporary storage
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/temp")); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: tempStorage });

exports.registerUser = [
  upload.single("profileImg"),
  asyncHandler(async (req, res, next) => {
    try {
      const requiredFields = [
        "username",
        "firstName",
        "lastName",
        "dateOfBirth",
        "email",
        "phone",
        "gender",
        "country",
        "role",
        "expertise",
        "password",
        "address"
      ];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          if (req.file) {
            fs.unlinkSync(req.file.path); // Delete the uploaded file
          }
          return next(new ApiError(`Missing required field: ${field}`, 400));
        }
      }

      const existingUser = await User.findOne({ email: req.body.email });
      const existingUsername = await User.findOne({
        username: req.body.username,
      });


      if (existingUsername) {
        if (req.file) {
          fs.unlinkSync(req.file.path); // Delete the uploaded file
        }
        return next(new ApiError("Username is already in use", 320));
      }
      
      if (existingUser) {
        if (req.file) {
          fs.unlinkSync(req.file.path); // Delete the uploaded file
        }
        return next(new ApiError("Email is already in use", 300));
      }



      req.hashedPassword = await bcrypt.hash(req.body.password, 12);
      next();
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete the uploaded file in case of any error
      }
      next(error);
    }
  }),
  asyncHandler(async (req, res, next) => {
    try {
      // Move the file from temporary storage to final destination
      let finalFileName = undefined;
      if (req.file) {
        const tempPath = req.file.path;
        const finalPath = path.join(__dirname, "../uploads/userimg", req.file.filename);
        fs.renameSync(tempPath, finalPath);
        finalFileName = req.file.filename;
      }

      const newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        email: req.body.email,
        phone: req.body.phone,
        gender: req.body.gender,
        country: req.body.country,
        role: req.body.role,
        expertise: JSON.parse(req.body.expertise),
        password: req.body.password,
        profileImg: finalFileName,
        address: req.body.address,
      });

      await newUser.save();

      const token = generateToken(newUser._id);

      res.status(201).json({
        message: "User registered successfully",
        user: newUser,
        token: token,
      });
    } catch (error) {
      if (req.file) {
        const tempPath = req.file.path;
        fs.unlinkSync(tempPath); // Delete the uploaded file in case of any error
      }
      next(new ApiError("An error occurred while registering the user", 500));
    }
  }),
];

/* ----------------------------------------------------- */
/**
 * @Desc   : user login
 * @Route  : @Post /api/auth/login
 * @access : public
 */
/* ----------------------------------------------------- */
exports.loginUser = asyncHandler(async (req, res, next) => {
  // Verify whether the email entered by the user exists and matches the password provided for that email.
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("incorrect email or password", 401));
  }
  // Generate Token
  const token = generateToken(user._id);

  // Send Response to Client Side
  res.status(200).json({ user, token });
});

/* ----------------------------------------------------- */
/**
 * @Desc   : forgot password
 * @Route  : @Post /api/auth/forgotPassword
 * @access : public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("user does not exist !", 404));
  }
  // Generate code verification
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash Reset Code and save it in the database
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;

  // Add expiration time for password reset code
  user.passwordResetExpired = Date.now() + 1440 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  // Send Reset Code via email

  await sendEmail({
    email: user.email,
    subject: `Password Reset Code`,
    html: resetCodeContent(resetCode),
  });

  res.status(200).json({
    status: "success",
    message: "Your password reset code sent to your email",
  });
});

/* ----------------------------------------------------- */

/**
 * @Desc   : Verify Reset Code
 * @Route  : @Post /api/auth/verifyResetCode
 * @access : public
 */
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // Get User from database
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  // Hash Reset Code that comes from body and compare it to the reset code stored in database
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  if (
    user.passwordResetCode !== hashedResetCode ||
    user.passwordResetExpired.getTime() < Date.now()
  ) {
    // Reset code is wrong or expired
    return next(new ApiError("Invalid reset code or expired",403));
  }

  user.passwordResetVerified = true;
  await user.save();

  return res.status(200).json({ msg: "you can move to next step" });
});

/* ----------------------------------------------------- */

/**
 * @Desc   : Reset password
 * @Route  : @Put /api/auth/resetPassword
 * @access : public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset Code not verified", 400));
  }
  // update user information
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpired = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  return res.status(200).json({ msg: "user password updated" });
});
