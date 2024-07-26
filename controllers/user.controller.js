const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");


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
        profilImg: `${baseUrl}/userimg/${user.profileImg}`
      };
  
      res.status(200).json(fullUser);
    } catch (error) {
      return next(new ApiError("Failed to get user details", 500));
    }
  });
  
