/**
 * Frontend sanitization utility for preventing XSS attacks
 * This is a second layer of defense after server-side sanitization
 */

/**
 * Sanitizes a string by encoding potentially dangerous HTML entities
 * but preserves common special characters for better user experience
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';

  // First decode any existing HTML entities to prevent double encoding
  const decodedInput = decodeHtmlEntities(input);
  
  // Only encode characters that could be used for XSS
  // We're not encoding quotes, apostrophes, ampersands and slashes for better UX
  return decodedInput
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * A more comprehensive function for decoding HTML entities
 * @param {string} input - String with possible HTML entities
 * @returns {string} - Decoded string
 */
const decodeHtmlEntities = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Create a textarea element to leverage browser's native HTML decoding
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  
  // Get the decoded content
  const decoded = textarea.value;
  
  // Clean up
  textarea.remove();
  
  return decoded;
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
