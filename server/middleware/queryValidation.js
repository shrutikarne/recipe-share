/**
 * Query parameter validation middleware
 * Provides validation functions for common query parameters
 */

/**
 * Validates and sanitizes pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePagination = (req, res, next) => {
  // Default values
  let { skip = 0, limit = 20 } = req.query;

  // Convert to numbers
  skip = Number(skip);
  limit = Number(limit);

  // Validate skip
  if (isNaN(skip) || skip < 0) {
    skip = 0;
  }

  // Validate limit (min: 1, max: 100)
  if (isNaN(limit) || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100;
  }

  // Add sanitized values back to query
  req.query.skip = skip;
  req.query.limit = limit;

  next();
};

/**
 * Validates and sanitizes numeric query parameters
 * @param {Array} params - Array of parameter names to validate
 * @returns {Function} Express middleware function
 */
const validateNumericParams = (params) => {
  return (req, res, next) => {
    for (const param of params) {
      if (req.query[param] !== undefined) {
        const value = Number(req.query[param]);

        if (isNaN(value)) {
          delete req.query[param]; // Remove invalid parameter
        } else {
          req.query[param] = value; // Replace with numeric value
        }
      }
    }

    next();
  };
};

/**
 * Sanitizes string query parameters to prevent injection
 * @param {Array} params - Array of parameter names to sanitize
 * @returns {Function} Express middleware function
 */
const sanitizeStringParams = (params) => {
  return (req, res, next) => {
    for (const param of params) {
      if (req.query[param]) {
        if (typeof req.query[param] === 'string') {
          // Remove any potentially dangerous characters
          req.query[param] = req.query[param].replace(/[^\w\s.-]/g, '');
        }
      }
    }

    next();
  };
};

/**
 * Validates and converts boolean string parameters to actual booleans
 * @param {Array} params - Array of parameter names to validate
 * @returns {Function} Express middleware function
 */
const validateBooleanParams = (params) => {
  return (req, res, next) => {
    for (const param of params) {
      if (req.query[param] !== undefined) {
        const value = req.query[param].toLowerCase();

        if (value === 'true' || value === '1' || value === 'yes') {
          req.query[param] = true;
        } else if (value === 'false' || value === '0' || value === 'no') {
          req.query[param] = false;
        } else {
          delete req.query[param]; // Remove invalid parameter
        }
      }
    }

    next();
  };
};

module.exports = {
  validatePagination,
  validateNumericParams,
  validateBooleanParams,
  sanitizeStringParams
};
