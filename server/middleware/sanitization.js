// Enhanced sanitization utilities for input protection
const xss = require('xss');

/**
 * Deep sanitization function that recursively sanitizes objects and arrays
 * @param {*} data - The data to sanitize (object, array, or primitive)
 * @returns {*} Sanitized data with the same structure
 */
const deepSanitize = (data) => {
  // Handle null/undefined values
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings - apply XSS sanitization
  if (typeof data === 'string') {
    return xss(data);
  }

  // Handle arrays - recursively sanitize each element
  if (Array.isArray(data)) {
    return data.map(item => deepSanitize(item));
  }

  // Handle objects - recursively sanitize each property
  if (typeof data === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = deepSanitize(value);
    }
    return sanitizedObj;
  }

  // For other data types (numbers, booleans), return as is
  return data;
};

/**
 * Express middleware that sanitizes request body, query params, and URL params
 * against XSS attacks
 */
const sanitizeRequests = (req, res, next) => {
  // Sanitize request body if present
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  // Sanitize URL query parameters
  if (req.query) {
    req.query = deepSanitize(req.query);
  }

  // Sanitize URL path parameters
  if (req.params) {
    req.params = deepSanitize(req.params);
  }

  next();
};

/**
 * Sanitizes HTML content but allows certain safe tags for rich text
 * Use this only for content that needs to preserve some HTML formatting
 * @param {string} content - HTML content to sanitize
 * @returns {string} Sanitized HTML with only allowed tags
 */
const sanitizeRichText = (content) => {
  if (typeof content !== 'string') return '';

  // Configure XSS with allowed tags for recipe instructions/descriptions
  const options = {
    whiteList: {
      p: ['style', 'class'],
      br: [],
      b: [],
      strong: [],
      i: [],
      em: [],
      u: [],
      ul: [],
      ol: [],
      li: [],
      h1: [],
      h2: [],
      h3: [],
      span: ['style', 'class'],
      div: ['style', 'class']
    },
    // Remove all attributes not specifically allowed
    stripIgnoreTagBody: true,
    css: {
      whiteList: {
        color: true,
        'text-align': true,
        'font-weight': true,
        'font-style': true
      }
    }
  };

  return xss(content, options);
};

// MongoDB query injection protection
const sanitizeMongoQuery = (query) => {
  if (typeof query !== 'object' || query === null) return query;

  // Check for MongoDB operator injection in keys
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    // Prevent keys starting with $ or containing .
    const safeKey = key.replace(/^\$/, '').replace(/\./g, '_');

    // Recursively check values if they are objects
    if (value !== null && typeof value === 'object') {
      sanitized[safeKey] = sanitizeMongoQuery(value);
    } else {
      sanitized[safeKey] = value;
    }
  }

  return sanitized;
};

module.exports = {
  sanitizeRequests,
  sanitizeRichText,
  sanitizeMongoQuery,
  deepSanitize
};
