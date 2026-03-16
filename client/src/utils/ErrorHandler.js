/**
 * ErrorHandler.js
 * Utility for consistent error handling across the application
 */

import { toast } from 'react-toastify';

/**
 * Maps HTTP status codes to error types
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error type
 */
const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  SERVER: 'server',
  NOT_FOUND: 'not_found',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

const getErrorTypeFromStatus = (statusCode) => {
  if (!statusCode) return ERROR_TYPES.NETWORK;

  switch (statusCode) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.PERMISSION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Default error messages for different error types
 */
const DEFAULT_ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network error. Please check your internet connection.',
  [ERROR_TYPES.AUTHENTICATION]: 'Authentication failed. Please log in again.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.PERMISSION]: 'You don\'t have permission to perform this action.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

/**
 * Handle API error and display appropriate toast message
 * @param {Error} error - Error object from API call
 * @param {string} customMessage - Optional custom message to override default
 * @returns {string} Error message that was displayed
 */
export const handleApiError = (error, customMessage = null) => {
  // Default values
  let errorType = ERROR_TYPES.UNKNOWN;
  let errorMessage = customMessage || DEFAULT_ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];

  // Extract status and message from error object if available
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    const { status, data } = error.response;
    errorType = getErrorTypeFromStatus(status);

    // Use server-provided error message if available
    if (data && data.message) {
      errorMessage = data.message;
    } else if (!customMessage) {
      errorMessage = DEFAULT_ERROR_MESSAGES[errorType];
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorType = ERROR_TYPES.NETWORK;
    errorMessage = customMessage || DEFAULT_ERROR_MESSAGES[ERROR_TYPES.NETWORK];
  }

  // Log error for debugging

  // Display toast message
  toast.error(errorMessage);

  return {
    type: errorType,
    message: errorMessage
  };
};
