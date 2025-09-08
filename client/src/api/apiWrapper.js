/**
 * apiWrapper.js
 * Wrapper functions for API calls with standardized error handling
 */

import API from './api';
import { handleApiError } from '../utils/ErrorHandler';

/**
 * Wrapper for GET requests with standardized error handling
 * @param {string} url - API endpoint
 * @param {Object} config - Axios config
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Promise resolving to response data
 */
export const apiGet = async (url, config = {}, errorMessage = null) => {
  try {
    const response = await API.get(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error, errorMessage);
    throw error;
  }
};

/**
 * Wrapper for GET with simple retry/backoff
 */
export const apiGetWithRetry = async (url, config = {}, retries = 2, backoffMs = 300, errorMessage = null) => {
  try {
    const response = await API.get(url, config);
    return response.data;
  } catch (error) {
    if (retries > 0 && (!error.response || (error.response && error.response.status >= 500))) {
      await new Promise(r => setTimeout(r, backoffMs));
      return apiGetWithRetry(url, config, retries - 1, backoffMs * 2, errorMessage);
    }
    handleApiError(error, errorMessage);
    throw error;
  }
};

/**
 * Wrapper for POST requests with standardized error handling
 * @param {string} url - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} config - Axios config
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Promise resolving to response data
 */
export const apiPost = async (url, data = {}, config = {}, errorMessage = null) => {
  try {
    const response = await API.post(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error, errorMessage);
    throw error;
  }
};

/**
 * Wrapper for PUT requests with standardized error handling
 * @param {string} url - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} config - Axios config
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Promise resolving to response data
 */
export const apiPut = async (url, data = {}, config = {}, errorMessage = null) => {
  try {
    const response = await API.put(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error, errorMessage);
    throw error;
  }
};

/**
 * Wrapper for DELETE requests with standardized error handling
 * @param {string} url - API endpoint
 * @param {Object} config - Axios config
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Promise resolving to response data
 */
export const apiDelete = async (url, config = {}, errorMessage = null) => {
  try {
    const response = await API.delete(url, config);
    return response.data;
  } catch (error) {
    handleApiError(error, errorMessage);
    throw error;
  }
};

/**
 * Wrapper for PATCH requests with standardized error handling
 * @param {string} url - API endpoint
 * @param {Object} data - Request payload
 * @param {Object} config - Axios config
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Promise resolving to response data
 */
export const apiPatch = async (url, data = {}, config = {}, errorMessage = null) => {
  try {
    const response = await API.patch(url, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error, errorMessage);
    throw error;
  }
};
