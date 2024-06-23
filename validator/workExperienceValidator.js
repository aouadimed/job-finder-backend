// validators/workExperienceValidator.js

const { check } = require('express-validator');
const validatorMiddleware = require('../middleware/validatorMiddleware');

const createWorkExperienceValidator = [
  check('jobTitle').notEmpty().withMessage('Job title is required'),
  check('companyName').notEmpty().withMessage('Company name is required'),
  check('startDate').notEmpty().withMessage('Start date is required'),
  check('ifStillWorking').isBoolean().withMessage('If still working must be a boolean'),
  check('endDate')
    .optional()
    .custom((value, { req }) => {
      if (!req.body.ifStillWorking && !value) {
        throw new Error('End date is required if not still working');
      }
      return true;
    }),
  validatorMiddleware,
];

const updateWorkExperienceValidator = [
  check('jobTitle').notEmpty().withMessage('Job title is required'),
  check('companyName').notEmpty().withMessage('Company name is required'),
  check('startDate').notEmpty().withMessage('Start date is required'),
  check('ifStillWorking').isBoolean().withMessage('If still working must be a boolean'),
  check('endDate')
    .optional()
    .custom((value, { req }) => {
      if (!req.body.ifStillWorking && !value) {
        throw new Error('End date is required if not still working');
      }
      return true;
    }),
  validatorMiddleware,
];

module.exports = { createWorkExperienceValidator, updateWorkExperienceValidator };
