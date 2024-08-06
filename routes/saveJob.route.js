const express = require('express');
const saveJob = require('../controllers/saveJob.controller');
const protectedRoute = require('../middleware/protectedRoute');

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post('/saved', saveJob.saveJobOffer);
router.delete('/saved/:jobOfferId', saveJob.deleteSavedJob);
router.get('/saved', saveJob.getSavedJobs);
router.get('/saved/:id', saveJob.getSavedJob);

module.exports = router;
