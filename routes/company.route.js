
const express = require("express");
const router = express.Router();
const { createOrUpdateCompany, getCompanies } = require('../controllers/company.controller');
const protectedRoute = require("../middleware/protectedRoute");
const upload = require('../middleware/multer');

/* ----------------------------------------------------- */

router.use(protectedRoute.requireLogin);

router.route("/company").post(upload.single('logo'), createOrUpdateCompany);

router.route("/company").get(getCompanies);


module.exports = router;





