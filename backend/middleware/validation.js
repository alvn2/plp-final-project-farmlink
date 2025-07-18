const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Custom validator for ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name is required and must be between 1-50 characters'),
  body('farmLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Farm location cannot exceed 100 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Crop validation rules
const validateCropCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Crop name is required and must be between 1-100 characters'),
  body('variety')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Crop variety cannot exceed 100 characters'),
  body('plantingDate')
    .optional()
    .isISO8601()
    .withMessage('Planting date must be a valid date')
    .custom((value) => {
      if (value) {
        const plantingDate = new Date(value);
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        if (plantingDate > twoYearsFromNow) {
          throw new Error('Planting date cannot be more than 2 years in the future');
        }
      }
      return true;
    }),
  body('expectedHarvestDate')
    .optional()
    .isISO8601()
    .withMessage('Expected harvest date must be a valid date'),
  body('area')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number'),
  body('areaUnit')
    .optional()
    .isIn(['acres', 'hectares', 'square_meters', 'square_feet'])
    .withMessage('Area unit must be one of: acres, hectares, square_meters, square_feet'),
  body('status')
    .optional()
    .isIn(['Planning', 'Planted', 'Growing', 'Harvested', 'Failed'])
    .withMessage('Status must be one of: Planning, Planted, Growing, Harvested, Failed'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

const validateCropUpdate = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid crop ID'),
  ...validateCropCreation.slice(0, -1), // Reuse creation rules except handleValidationErrors
  handleValidationErrors
];

// Task validation rules
const validateTaskCreation = [
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description is required and must be between 1-500 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      const dueDate = new Date(value);
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      if (dueDate > twoYearsFromNow) {
        throw new Error('Due date cannot be more than 2 years in the future');
      }
      return true;
    }),
  body('cropId')
    .custom(isValidObjectId)
    .withMessage('Valid crop ID is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be one of: Low, Medium, High, Critical'),
  body('category')
    .optional()
    .isIn(['Planting', 'Watering', 'Fertilizing', 'Pest Control', 'Harvesting', 'Maintenance', 'Other'])
    .withMessage('Category must be one of: Planting, Watering, Fertilizing, Pest Control, Harvesting, Maintenance, Other'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Estimated duration must be between 0 and 1440 minutes'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors
];

const validateTaskUpdate = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description must be between 1-500 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (value) {
        const dueDate = new Date(value);
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        if (dueDate > twoYearsFromNow) {
          throw new Error('Due date cannot be more than 2 years in the future');
        }
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['Pending', 'Completed', 'Overdue'])
    .withMessage('Status must be one of: Pending, Completed, Overdue'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be one of: Low, Medium, High, Critical'),
  body('category')
    .optional()
    .isIn(['Planting', 'Watering', 'Fertilizing', 'Pest Control', 'Harvesting', 'Maintenance', 'Other'])
    .withMessage('Category must be one of: Planting, Watering, Fertilizing, Pest Control, Harvesting, Maintenance, Other'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Estimated duration must be between 0 and 1440 minutes'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors
];

// Parameter validation
const validateObjectIdParam = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation for tasks
const validateTaskQuery = [
  query('status')
    .optional()
    .isIn(['Pending', 'Completed', 'Overdue'])
    .withMessage('Status must be one of: Pending, Completed, Overdue'),
  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be one of: Low, Medium, High, Critical'),
  query('category')
    .optional()
    .isIn(['Planting', 'Watering', 'Fertilizing', 'Pest Control', 'Harvesting', 'Maintenance', 'Other'])
    .withMessage('Category must be one of: Planting, Watering, Fertilizing, Pest Control, Harvesting, Maintenance, Other'),
  query('cropId')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Invalid crop ID format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCropCreation,
  validateCropUpdate,
  validateTaskCreation,
  validateTaskUpdate,
  validateObjectIdParam,
  validateTaskQuery,
  handleValidationErrors
};
