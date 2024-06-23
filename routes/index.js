const ResumeRoute = require("./resume.route");
const authRoute = require("./auth.route");
const summaryRoute = require("./summary.route");
const workexperienceRoue = require("./workExperiences.route");
const educationRoue = require("./education.route");



const mountRoutes = (app) => {
  app.use("/api/resume", ResumeRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/summary", summaryRoute);
  app.use("/api/workexperience", workexperienceRoue);
  app.use("/api/education", educationRoue);



};

module.exports = mountRoutes;