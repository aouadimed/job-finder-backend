const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const fs = require("fs");
const path = require("path");
const multer = require("multer");


  /**
   * @Desc   : Get user details
   * @Route  : @Get /api/users/
   * @Access : Private
   */
  exports.getProfilHeader = asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return next(new ApiError("User not found", 404));
      }
  
      const baseUrl = process.env.BASE_URL;
      const fullUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        profilImg: user.profileImg ? `${baseUrl}/userimg/${user.profileImg}` : "undefined"
      };
  
      res.status(200).json(fullUser);
    } catch (error) {
      return next(new ApiError("Failed to get user details", 500));
    }
  });



  // Configure multer for profile image uploads
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/userimg")); // Permanent storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadProfile = multer({ storage: profileStorage });

/**
 * @Desc   : Handle profile updates
 * @Route  : @Put /api/users/profile
 * @Access : Private
 */
exports.updateUserProfile = [
  uploadProfile.single("profileImg"), // Handle single image upload
  asyncHandler(async (req, res, next) => {
    try {
      const { firstName, lastName, deletePhoto } = req.body; // Extract input fields
      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new ApiError("User not found", 404));
      }

      // Update first name or last name if they are provided and changed
      if (firstName && firstName !== user.firstName) {
        user.firstName = firstName;
      }
      if (lastName && lastName !== user.lastName) {
        user.lastName = lastName;
      }

      // Handle photo deletion
      if (deletePhoto === "true") {
        if (user.profileImg) {
          const oldImagePath = path.join(__dirname, "../uploads/userimg", user.profileImg);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath); // Delete the old image
          }
          user.profileImg = undefined; // Clear the profile image reference
        }
      }

      // Handle photo upload
      if (req.file) {
        // Delete old profile image if a new one is uploaded
        if (user.profileImg) {
          const oldImagePath = path.join(__dirname, "../uploads/userimg", user.profileImg);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        user.profileImg = req.file.filename; // Save new profile image filename
      }

      await user.save();

      const baseUrl = process.env.BASE_URL;
      const updatedUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        profileImg: user.profileImg ? `${baseUrl}/userimg/${user.profileImg}` : undefined,
      };

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      if (req.file) {
        const tempPath = req.file.path;
        fs.unlinkSync(tempPath); // Clean up uploaded file in case of error
      }
      return next(new ApiError("Failed to update profile", 500));
    }
  }),
];
  
