const express = require('express');
const {
  createSkill,
  deleteSkill,
  getSkills,
} = require('../controllers/skill.controller');
const protectedRoute = require('../middleware/protectedRoute');

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post('/skills', createSkill);
router.delete('/skills/:id', deleteSkill);
router.get('/skills', getSkills);

module.exports = router;
