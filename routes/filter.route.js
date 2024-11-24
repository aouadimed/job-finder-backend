const express = require('express');
const {
  filterJobOffers,
} = require('../controllers/filter.controller');
const protectedRoute = require('../middleware/protectedRoute');

const router = express.Router();

//router.use(protectedRoute.requireLogin);

router.post('/filter', filterJobOffers);


module.exports = router;
