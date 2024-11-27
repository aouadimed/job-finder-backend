const mongoose = require("mongoose");
const JobOffer = require("../models/jobOffer.model");
const Company = require("../models/company.model");
const Category = require("../models/jobCategory.model");

// Centralized Keywords
const keywordConfig = {
  education: {
    highSchool: [
      "high school diploma",
      "secondary school",
      "GED",
      "grade 12",
      "high school graduate",
    ],
    bachelors: [
      "bachelor",
      "undergraduate degree",
      "BA",
      "BS",
      "BSc",
      "college degree",
    ],
    masters: [
      "master",
      "graduate degree",
      "MA",
      "MSc",
      "MBA",
      "advanced degree",
    ],
    phd: [
      "PhD",
      "doctorate",
      "doctoral program",
      "research degree",
      "advanced research",
    ],
  },
  jobLevel: {
    internship: [
      "intern",
      "trainee",
      "apprenticeship",
      "graduate program",
      "fellowship",
    ],
    entryLevel: [
      "beginner",
      "junior",
      "associate",
      "fresh graduate",
      "early career",
    ],
    associateSupervisor: [
      "mid-level",
      "team leader",
      "coordinator",
      "assistant manager",
      "supervisor",
    ],
    midSeniorManager: [
      "senior",
      "manager",
      "department head",
      "team manager",
      "program manager",
    ],
    directorExecutive: [
      "director",
      "executive",
      "CEO",
      "VP",
      "managing director",
      "founder",
      "partner",
    ],
  },
  experience: {
    noExperience: [
      "no experience",
      "entry-level role",
      "zero experience",
      "no prior experience required",
    ],
    oneToFiveYears: ["1 year", "2 years", "3 years", "4 years", "5 years"],
    sixToTenYears: ["6 years", "7 years", "8 years", "9 years", "10 years"],
    moreThanTenYears: [
      "10+ years",
      "extensive experience",
      "senior-level experience",
    ],
  },
};

// Utility: Generate Regex for Filtering
const generateRegex = (keywords) =>
  keywords.map((keyword) => ({
    $or: [
      { jobDescription: { $regex: `\\b${keyword}\\b`, $options: "i" } },
      { minimumQualifications: { $regex: `\\b${keyword}\\b`, $options: "i" } },
    ],
  }));

// Filters
const applyFilters = {
  location: async (filters, query) => {
    if (filters.location && filters.location.trim() !== "") {
      try {
        const jobOffers = await JobOffer.find().populate("user", "_id");
        const matchingUserIds = [];
        for (const jobOffer of jobOffers) {
          const company = await Company.findOne({ user: jobOffer.user });
          if (
            company &&
            new RegExp(filters.location, "i").test(company.country)
          ) {
            matchingUserIds.push(company.user); // Collect user IDs matching location
          }
        }
        if (matchingUserIds.length > 0) {
          query.$and.push({ user: { $in: matchingUserIds } });
        } else {
          query.$and.push({ _id: { $exists: false } });
        }
      } catch (error) {
        console.error("Error processing location filter:", error);
      }
    }
  },

  education: (filters, query) => {
    if (filters.education && filters.education.length > 0) {
      const educationFilters = [];
      filters.education.forEach((level) => {
        const keywords = keywordConfig.education[level.toLowerCase()];
        if (keywords) educationFilters.push(...generateRegex(keywords));
      });
      if (educationFilters.length > 0)
        query.$and.push({ $or: educationFilters });
    }
  },

  jobLevel: (filters, query) => {
    if (filters.jobLevel && filters.jobLevel.length > 0) {
      const jobLevelFilters = [];
      filters.jobLevel.forEach((level) => {
        const keywords =
          keywordConfig.jobLevel[level.replace(/\s/g, "").toLowerCase()];
        if (keywords) jobLevelFilters.push(...generateRegex(keywords));
      });
      if (jobLevelFilters.length > 0) query.$and.push({ $or: jobLevelFilters });
    }
  },

  experience: async (filters, query) => {
    if (filters.experience && filters.experience.length > 0) {
      const experienceFilters = [];
      filters.experience.forEach((exp) => {
        switch (exp) {
          case "No Experience":
            experienceFilters.push({
              $and: [
                {
                  $or: [
                    {
                      jobDescription: {
                        $regex: "\\b(no experience|entry-level)\\b",
                        $options: "i",
                      },
                    },
                    {
                      minimumQualifications: {
                        $regex: "\\b(no experience|entry-level)\\b",
                        $options: "i",
                      },
                    },
                  ],
                },
                {
                  $nor: [
                    {
                      jobDescription: {
                        $regex: "\\b\\d+\\s?(\\+?\\s?years|yrs)\\b",
                        $options: "i",
                      },
                    },
                    {
                      minimumQualifications: {
                        $regex: "\\b\\d+\\s?(\\+?\\s?years|yrs)\\b",
                        $options: "i",
                      },
                    },
                  ],
                },
              ],
            });
            break;

          case "1-5 Years":
            experienceFilters.push({
              $or: [
                {
                  jobDescription: {
                    $regex:
                      "\\b((1|2|3|4|5)\\s?(\\+?\\s?years|yrs)|1-5\\s?years|at least 1 year|up to 5 years)\\b",
                    $options: "i",
                  },
                },
                {
                  minimumQualifications: {
                    $regex:
                      "\\b((1|2|3|4|5)\\s?(\\+?\\s?years|yrs)|1-5\\s?years|at least 1 year|up to 5 years)\\b",
                    $options: "i",
                  },
                },
              ],
            });
            break;

          case "6-10 Years":
            experienceFilters.push({
              $or: [
                {
                  jobDescription: {
                    $regex:
                      "\\b((6|7|8|9|10)\\s?(\\+?\\s?years|yrs)|6-10\\s?years|at least 6 years|up to 10 years)\\b",
                    $options: "i",
                  },
                },
                {
                  minimumQualifications: {
                    $regex:
                      "\\b((6|7|8|9|10)\\s?(\\+?\\s?years|yrs)|6-10\\s?years|at least 6 years|up to 10 years)\\b",
                    $options: "i",
                  },
                },
              ],
            });
            break;

          case "More Than 10 Years":
            experienceFilters.push({
              $or: [
                {
                  jobDescription: {
                    $regex:
                      "\\b((1[1-9]|[2-9]\\d+)\\s?(\\+?\\s?years|yrs)|more than 10 years|10\\+ years)\\b",
                    $options: "i",
                  },
                },
                {
                  minimumQualifications: {
                    $regex:
                      "\\b((1[1-9]|[2-9]\\d+)\\s?(\\+?\\s?years|yrs)|more than 10 years|10\\+ years)\\b",
                    $options: "i",
                  },
                },
              ],
            });
            break;

          default:
            console.warn(`Unknown experience filter: ${exp}`);
            break;
        }
      });

      if (experienceFilters.length > 0) {
        query.$and.push({ $or: experienceFilters });
      }
    }
  },

  jobFunction: (filters, query) => {
    if (filters.jobFunctionIds && filters.jobFunctionIds.length > 0) {
      query.$and.push({ categoryId: { $in: filters.jobFunctionIds } });
    }
  },

  workType: (filters, query) => {
    if (filters.workTypeIndexes && filters.workTypeIndexes.length > 0) {
      query.$and.push({
        locationTypeIndex: {
          $in: filters.workTypeIndexes.map((index) => index + 1),
        },
      });
    }
  },

  employmentType: (filters, query) => {
    if (
      filters.employmentTypeIndexes &&
      filters.employmentTypeIndexes.length > 0
    ) {
      query.$and.push({
        employmentTypeIndex: {
          $in: filters.employmentTypeIndexes.map((index) => index + 1),
        },
      });
    }
  },
  search: async (filters, query) => {
    if (filters.search && filters.search.trim() !== "") {
      const search = filters.search.trim();
  

      const matchingCategories = await Category.find({
        "subcategories.name": { $regex: search, $options: "i" },
      }).select("subcategories._id subcategories.name");
  

      const subcategoryIds = matchingCategories
        .flatMap((cat) => cat.subcategories || [])
        .filter((sub) => new RegExp(search, "i").test(sub.name))
        .map((sub) => String(sub._id));
  
      console.log("Matching Subcategory IDs:", subcategoryIds);
  

      query.$and.push({
        $or: [
          { subcategoryId: { $in: subcategoryIds } },
          { jobDescription: { $regex: search, $options: "i" } },
          { minimumQualifications: { $regex: search, $options: "i" } }, 
        ],
      });
    }
  },  
};
const filterJobOffers = async (req, res) => {
  try {
    const filters = req.body;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const query = { $and: [{ active: true }] };

    console.log("Filters received:", filters);

    if (Object.keys(filters).length > 0) {
      await applyFilters.search(filters, query);
      await applyFilters.location(filters, query);
      applyFilters.education(filters, query);
      applyFilters.jobLevel(filters, query);
      await applyFilters.experience(filters, query);
      applyFilters.jobFunction(filters, query);
      applyFilters.workType(filters, query);
      applyFilters.employmentType(filters, query);

      if (query.$and.length === 0) {
        console.log("Filters applied but no matching conditions were found.");
        return res.status(200).json({
          jobOffers: [],
          totalPages: 0,
          currentPage: pageNumber,
        });
      }
    } else {
      console.log("No filters applied, fetching all job offers.");
    }

    console.log("Final Query:", JSON.stringify(query, null, 2));

    const jobOffers = await JobOffer.find(
      query.$and && query.$and.length > 0 ? query : {}
    )
    .sort({ createdAt: -1, _id: -1 })
    .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("categoryId", "name subcategories");

    console.log(`Number of job offers fetched: ${jobOffers.length}`);

    const jobOffersWithDetails = await Promise.all(
      jobOffers.map(async (jobOffer) => {
        const category = jobOffer.categoryId;
        const subcategory = category?.subcategories?.find(
          (sub) => sub._id.toString() === jobOffer.subcategoryId
        );

        const company = await Company.findOne({ user: jobOffer.user });

        return {
          id: jobOffer._id,
          employmentTypeIndex: jobOffer.employmentTypeIndex,
          locationTypeIndex: jobOffer.locationTypeIndex,
          subcategoryName: subcategory
            ? subcategory.name
            : "Unknown Subcategory",
          companyName: company ? company.companyName : "Unknown Company",
          companyCountry: company ? company.country : "Unknown Country",
          logoName: company
            ? `${process.env.BASE_URL}/companylogos/${company.logoName}`
            : null,
        };
      })
    );

    res.status(200).json({
      jobOffers: jobOffersWithDetails,
      totalPages: Math.ceil(
        (await JobOffer.countDocuments(
          query.$and && query.$and.length > 0 ? query : {}
        )) / limitNumber
      ),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error filtering job offers:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while filtering job offers.",
    });
  }
};

module.exports = { filterJobOffers };
