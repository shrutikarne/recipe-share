/**
 * Sets up a pre-configured Axios instance for API requests to the backend.
 * Works with HTTP-only cookies for authentication instead of Authorization header.
 */
import axios from "axios";
import {
  isAuthenticated,
  isTokenExpiringSoon,
  setLoggedOut
} from "../utils/tokenManager";

/**
 * Axios instance with base URL set to backend API
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  // Important for cookie handling
  withCredentials: true
});

// Pending requests queue for token refresh
let pendingRequests = [];
let isRefreshing = false;

/**
 * Refresh the authentication token
 * @returns {Promise<boolean>} Success status
 */
const refreshToken = async () => {
  // If already refreshing, wait for that refresh to complete
  if (isRefreshing) {
    return new Promise(resolve => {
      pendingRequests.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    // Make the refresh request
    await axios.post(
      "http://localhost:5000/api/auth/refresh",
      {},
      { withCredentials: true }
    );

    // Resolve all pending requests with success
    pendingRequests.forEach(callback => callback(true));
    pendingRequests = [];

    return true;
  } catch (error) {

    // If refresh failed, we need to log the user out
    if (error.response?.status === 401) {
      setLoggedOut();

      // Redirect to login page if unauthorized
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth?mode=login&reason=session_expired';
      }
    }

    // Resolve all pending requests with failure
    pendingRequests.forEach(callback => callback(false));
    pendingRequests = [];

    return false;
  } finally {
    isRefreshing = false;
  }
};

// Intercept requests to handle token refresh
API.interceptors.request.use(async (config) => {
  // If user is authenticated and token is expiring soon, refresh it
  if (isAuthenticated() && isTokenExpiringSoon()) {
    await refreshToken();
  }

  return config;
});

// Handle 401 responses (expired token) with refresh attempt
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      isAuthenticated()) {

      originalRequest._retry = true;

      // Try to refresh the token
      const refreshSuccessful = await refreshToken();

      // If refresh was successful, retry the original request
      if (refreshSuccessful) {
        return API(originalRequest);
      }
    }

    // If we get here, either the refresh failed or there was a different error
    return Promise.reject(error);
  }
);

// Add convenience method for logout
API.logout = function () {
  return API.post("/auth/logout");
};

export default API;
