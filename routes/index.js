const ResumeRoute = require("./resume.route");
const authRoute = require("./auth.route");
const summaryRoute = require("./summary.route");
const workexperienceRoute = require("./workExperiences.route");
const educationRoute = require("./education.route");
const projectRoute = require("./project.route");
const languageRoute = require("./language.route");
const skillsRoute = require("./skill.route");
const usersRoute = require("./user.route");
const contactInfoRoute = require("./contactInfo.route");
const companyRoute = require("./company.route");
const jobOfferRoute = require("./jobOffer.route");
const jobCategoriesRoute = require("./jobCategory.route");
const saveJobRoute = require("./saveJob.route");
const organizationActivity = require("./organization_activity.route");
const profilRoute = require("./profil.route");
const jobApplicationRoute = require("./job_application.route");


const mountRoutes = (app) => {
  app.use("/api/resume", ResumeRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/summary", summaryRoute);
  app.use("/api/workexperience", workexperienceRoute);
  app.use("/api/education", educationRoute);
  app.use("/api/project", projectRoute);
  app.use("/api/language", languageRoute);
  app.use("/api/skill", skillsRoute);
  app.use("/api/users", usersRoute);
  app.use("/api/contactinfo", contactInfoRoute);
  app.use("/api/company", companyRoute);
  app.use("/api/job-offers", jobOfferRoute);
  app.use("/api/job-category", jobCategoriesRoute);
  app.use("/api/saved", saveJobRoute);
  app.use("/api/organization_activity", organizationActivity);
  app.use("/api/profil", profilRoute);
  app.use("/api/JobApplication", jobApplicationRoute);


};

module.exports = mountRoutes;
