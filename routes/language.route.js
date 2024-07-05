const express = require("express");
const {
  createLanguage,
  updateLanguage,
  getLanguages,
  getLanguage,
  deleteLanguage,
} = require("../controllers/languages.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post("/create", createLanguage);
router.put("/update/:id", updateLanguage);
router.get("/languages", getLanguages);
router.get("/language/:id", getLanguage);
router.delete("/delete/:id", deleteLanguage);

module.exports = router;
