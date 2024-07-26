const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const ContactInfo = require("../models/contact_info.model");
const ApiError = require("../utils/apiError");

/**
 * @Desc   : Get contact_info details
 * @Route  : @Get /api/contact-info/
 * @Access : Private
 */
exports.getContactInfoDetails = asyncHandler(async (req, res, next) => {
  try {
    const contactInfo = await ContactInfo.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id).select('country email phone address');

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    if (contactInfo) {
      const response = {
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        country: user.country
      };
      res.status(200).json(response);
    } else {
      const response = {
        email: user.email,
        phone: user.phone,
        address: user.address,
        country: user.country
      };
      res.status(200).json(response);
    }
  } catch (error) {
    return next(new ApiError("Failed to get contact info details", 500));
  }
});

/**
 * @Desc   : Update contact-info
 * @Route  : @Put /api/contact-info/
 * @Access : Private
 */
exports.updateContactInfoDetails = asyncHandler(async (req, res, next) => {
  try {
    const { email, phone, address } = req.body;

    const contactInfo = await ContactInfo.findOne({ user: req.user._id });

    if (contactInfo) {
      contactInfo.email = email || contactInfo.email;
      contactInfo.phone = phone || contactInfo.phone;
      contactInfo.address = address || contactInfo.address;
      await contactInfo.save();
      const user = await User.findById(req.user._id).select('country');
      res.status(200).json({
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        country: user.country
      });
    } else {
      const newContactInfo = new ContactInfo({
        user: req.user._id,
        email,
        phone,
        address
      });
      await newContactInfo.save();
      const user = await User.findById(req.user._id).select('country');
      res.status(201).json({
        email: newContactInfo.email,
        phone: newContactInfo.phone,
        address: newContactInfo.address,
        country: user.country
      });
    }
  } catch (error) {
    return next(new ApiError("Failed to update contact info details", 500));
  }
});
