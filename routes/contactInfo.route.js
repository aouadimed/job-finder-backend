const express = require("express");
const router = express.Router();
const ContactInfoController = require("../controllers/contactInfo.controller");
const protectedRoute = require("../middleware/protectedRoute");

/* ----------------------------------------------------- */

router.use(protectedRoute.requireLogin);

router.route("/contact-info").put(ContactInfoController.updateContactInfoDetails);

router.route("/contact-info").get(ContactInfoController.getContactInfoDetails);


module.exports = router;
