const express = require("express");
const {
  createOrganizationActivity,
  getAllOrganizationActivities,
  getOrganizationActivity,
  updateOrganizationActivity,
  deleteOrganizationActivity,
} = require("../controllers/organization_activity.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post("/create", createOrganizationActivity);
router.get("/activities", getAllOrganizationActivities);
router.get("/activity/:id", getOrganizationActivity);
router.put("/update/:id", updateOrganizationActivity);
router.delete("/delete/:id", deleteOrganizationActivity);

module.exports = router;
