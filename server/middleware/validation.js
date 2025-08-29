/**
 * Validation middleware for API endpoints
 * Provides functions for validating and sanitizing request data
 */
const mongoose = require("mongoose");

/**
 * Validates that the provided value is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} Whether the ID is valid
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates that required fields are present in the request body
 * @param {Array} requiredFields - Array of field names that must be present
 * @returns {Function} Express middleware function
 */
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields
      });
    }

    next();
  };
};

/**
 * Validates that a field meets specified criteria
 * @param {Object} validations - Object mapping field names to validation functions
 * @returns {Function} Express middleware function
 */
const validateFields = (validations) => {
  return (req, res, next) => {
    const errors = {};

    for (const [field, validation] of Object.entries(validations)) {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        const result = validation(req.body[field]);
        if (result !== true) {
          errors[field] = result;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors
      });
    }

    next();
  };
};

/**
 * Validates that a MongoDB ID parameter is valid
 * @param {string} paramName - The name of the parameter to validate
 * @returns {Function} Express middleware function
 */
const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({ error: `${paramName} parameter is required` });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }

    next();
  };
};

/**
 * Sanitizes an email string
 * @param {string} email - The email to sanitize
 * @returns {string} The sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim();
};

/**
 * Sanitizes a string (removes HTML tags and trims)
 * @param {string} str - The string to sanitize
 * @returns {string} The sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  // Remove HTML tags and trim
  return str.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Sanitizes an array of strings
 * @param {Array} arr - The array to sanitize
 * @returns {Array} The sanitized array
 */
const sanitizeStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => typeof item === 'string' ? sanitizeString(item) : '').filter(Boolean);
};

/**
 * Applies sanitization to request body
 * @param {Object} sanitizers - Object mapping field names to sanitizer functions
 * @returns {Function} Express middleware function
 */
const sanitizeBody = (sanitizers) => {
  return (req, res, next) => {
    if (!req.body) {
      req.body = {};
      return next();
    }

    for (const [field, sanitizer] of Object.entries(sanitizers)) {
      if (req.body[field] !== undefined) {
        req.body[field] = sanitizer(req.body[field]);
      }
    }

    next();
  };
};

// Common validation functions

/**
 * Validates an email string
 * @param {string} email - The email to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateEmail = (email) => {
  if (typeof email !== 'string') {
    return 'Email must be a string';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return true;
};

/**
 * Validates a password string
 * @param {string} password - The password to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validatePassword = (password) => {
  if (typeof password !== 'string') {
    return 'Password must be a string';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  return true;
};

/**
 * Validates a name string
 * @param {string} name - The name to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateName = (name) => {
  if (typeof name !== 'string') {
    return 'Name must be a string';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }

  if (name.trim().length > 50) {
    return 'Name must be less than 50 characters long';
  }

  return true;
};

/**
 * Validates an array
 * @param {Array} arr - The array to validate
 * @param {Function} itemValidator - Function to validate each item
 * @returns {boolean|string} True if valid, error message if not
 */
const validateArray = (arr, itemValidator) => {
  if (!Array.isArray(arr)) {
    return 'Value must be an array';
  }

  for (let i = 0; i < arr.length; i++) {
    const result = itemValidator(arr[i]);
    if (result !== true) {
      return `Item at index ${i} is invalid: ${result}`;
    }
  }

  return true;
};

/**
 * Validates a string
 * @param {string} str - The string to validate
 * @param {Object} options - Validation options
 * @returns {boolean|string} True if valid, error message if not
 */
const validateString = (str, { min = 0, max = Infinity, pattern = null } = {}) => {
  if (typeof str !== 'string') {
    return 'Value must be a string';
  }

  if (str.trim().length < min) {
    return `Value must be at least ${min} characters long`;
  }

  if (str.trim().length > max) {
    return `Value must be less than ${max} characters long`;
  }

  if (pattern && !pattern.test(str)) {
    return 'Value does not match the required pattern';
  }

  return true;
};

/**
 * Validates a number
 * @param {number} num - The number to validate
 * @param {Object} options - Validation options
 * @returns {boolean|string} True if valid, error message if not
 */
const validateNumber = (num, { min = -Infinity, max = Infinity, integer = false } = {}) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return 'Value must be a number';
  }

  if (integer && !Number.isInteger(num)) {
    return 'Value must be an integer';
  }

  if (num < min) {
    return `Value must be at least ${min}`;
  }

  if (num > max) {
    return `Value must be less than ${max}`;
  }

  return true;
};

/**
 * Validates a URL string
 * @param {string} url - The URL to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateUrl = (url) => {
  if (typeof url !== 'string') {
    return 'URL must be a string';
  }

  try {
    new URL(url);
    return true;
  } catch (err) {
    return 'Invalid URL format';
  }
};

module.exports = {
  validateRequiredFields,
  validateFields,
  validateIdParam,
  sanitizeBody,
  sanitizeEmail,
  sanitizeString,
  sanitizeStringArray,
  isValidObjectId,
  validateEmail,
  validatePassword,
  validateName,
  validateArray,
  validateString,
  validateNumber,
  validateUrl
};
