const ResumeRoute = require("./resume.route");
const authRoute = require("./auth.route");
const summaryRoute = require("./summary.route");



const mountRoutes = (app) => {
  app.use("/api/resume", ResumeRoute);
  app.use("/api/auth", authRoute);
  app.use("/api/summary", summaryRoute);

};

module.exports = mountRoutes;