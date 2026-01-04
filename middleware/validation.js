const { body, validationResult } = require('express-validator');

// Validation rules for registration
const validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscore'),
  
  body('email')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('role')
    .optional()
    .isIn(['user', 'distributor', 'admin']).withMessage('Invalid role')
];

// Validation rules for login
const validateLogin = [
  body('username')
    .notEmpty().withMessage('Username or email is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation rules for update profile
const validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('first_name')
    .optional()
    .isLength({ min: 1 }).withMessage('First name is required'),
  
  body('last_name')
    .optional()
    .isLength({ min: 1 }).withMessage('Last name is required'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email')
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  checkValidation
};