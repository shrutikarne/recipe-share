/**
 * Frontend sanitization utility for preventing XSS attacks
 * This is a second layer of defense after server-side sanitization
 */

/**
 * Sanitizes a string by encoding HTML entities
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes an object's string properties recursively
 * @param {Object} data - Object with properties to sanitize
 * @returns {Object} - Object with sanitized string properties
 */
export const sanitizeObject = (data) => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Creates a sanitized input handler for React form inputs
 * @param {Function} setter - State setter function from useState
 * @returns {Function} - Event handler for input changes
 */
export const createSanitizedChangeHandler = (setter) => {
  return (e) => {
    const { name, value } = e.target;
    setter(prevState => ({
      ...prevState,
      [name]: sanitizeString(value)
    }));
  };
};

/**
 * Sanitizes form data before submission
 * @param {Object} formData - Form data object to sanitize
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  return sanitizeObject(formData);
};

/**
 * Renders content that has been sanitized but needs to be displayed as HTML
 * Use this carefully and only for content that has been sanitized on the server
 * @param {string} htmlContent - Sanitized HTML content
 * @returns {Object} - Object with __html property for dangerouslySetInnerHTML
 */
export const createSanitizedMarkup = (htmlContent) => {
  return { __html: htmlContent || '' };
};

// Create named object before exporting as default
const sanitizeUtils = {
  sanitizeString,
  sanitizeObject,
  createSanitizedChangeHandler,
  sanitizeFormData,
  createSanitizedMarkup
};

export default sanitizeUtils;
