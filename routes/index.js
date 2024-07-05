const ResumeRoute = require("./resume.route");
const authRoute = require("./auth.route");
const summaryRoute = require("./summary.route");
const workexperienceRoute = require("./workExperiences.route");
const educationRoute = require("./education.route");
const projectRoute = require("./project.route");
const languageRoute = require("./language.route");



const mountRoutes = (app) => {
  app.use("/api/resume", ResumeRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/summary", summaryRoute);
  app.use("/api/workexperience", workexperienceRoute);
  app.use("/api/education", educationRoute);
  app.use("/api/project", projectRoute);
  app.use("/api/language", languageRoute);



};

module.exports = mountRoutes;