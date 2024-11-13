const express = require("express");
const router = express.Router();
const {
  createJobOffer,
  updateJobOffer,
  deleteJobOffer,
  getJobOffers,
  getJobOffer,
  toggleJobOfferActive,
  getRecentJobOffersAdded
} = require("../controllers/jobOffer.controller");
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

router.use(protectedRoute.requireLogin);

router.route("/job-offers").post(createJobOffer);

router.route("/job-offers/:id").put(updateJobOffer);

router.route("/job-offers/:id").delete(deleteJobOffer);

router.route("/job-offers").get(getJobOffers);

router.route("/job-offers/:id").get(getJobOffer);

router.route("/recent").get(getRecentJobOffersAdded);

router.route("/job-offers/:id/active").put(toggleJobOfferActive);

module.exports = router;
