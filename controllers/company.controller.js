const asyncHandler = require("express-async-handler");
const Company = require("../models/company.model");
const ApiError = require("../utils/apiError");

/* ----------------------------------------------------- */
/**
 * @Desc   : Create or update a company profile
 * @Route  : @Post /api/company
 * @access : Private
 */
/* ----------------------------------------------------- */

exports.createOrUpdateCompany = asyncHandler(async (req, res, next) => {
  try {
    const { companyName, aboutCompany, website, country, addresses } = req.body;
    const userId = req.user._id;

    let logoName;
    if (req.file) {
      logoName = req.file.filename; 
    }

    let company = await Company.findOne({ user: userId });

    if (company) {
      company.companyName = companyName;
      company.aboutCompany = aboutCompany;
      company.website = website;
      company.country = country;
      company.addresses = JSON.parse(addresses);
      if (logoName) company.logoName = logoName;
      await company.save();
      res.status(200).json(company);
    } else {
      company = new Company({
        user: userId,
        companyName,
        aboutCompany,
        website,
        country,
        addresses: JSON.parse(addresses),
        logoName,
      });
      await company.save();
      res.status(201).json(company);
    }
  } catch (error) {
    console.error("Error creating or updating company:", error);
    return next(new ApiError("Failed to create or update company profile", 500));
  }
});


/**
 * @Desc   : Get user company profiles
 * @Route  : @Get /api/companies
 * @Access : Private
 */
exports.getCompanies = asyncHandler(async (req, res, next) => {
  try {
    const companies = await Company.find({ user: req.user._id });

    if (companies.length === 0) {
      return res.status(201).json({ message: "No companies found." });
    }

    const baseUrl = process.env.BASE_URL;
    const companiesWithLogoUrl = companies.map(company => ({
      ...company._doc,
      logoName: company.logoName ? `${baseUrl}/companylogos/${company.logoName}` : null
    }));

    res.status(200).json(companiesWithLogoUrl);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return next(new ApiError("Failed to get companies", 500));
  }
});
