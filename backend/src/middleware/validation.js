const { body, validationResult } = require('express-validator');
const { error } = require('../utils/response');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed', 400, errors.array());
  }
  next();
};

// Auth validations
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors
];

// Booking validations
const bookingValidation = [
  body('type').isIn(['flight', 'hotel', 'package', 'activity']).withMessage('Valid booking type required'),
  body('contact.email').isEmail().withMessage('Valid contact email required'),
  body('contact.phone').isMobilePhone().withMessage('Valid phone number required'),
  body('pricing.totalAmount').isNumeric().withMessage('Valid total amount required'),
  handleValidationErrors
];

// Review validations
const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  bookingValidation,
  reviewValidation,
  handleValidationErrors
};