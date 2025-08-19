/**
 * Sets up a pre-configured Axios instance for API requests to the backend.
 * Automatically attaches JWT token from localStorage to Authorization header if present.
 */
import axios from "axios";

/**
 * Axios instance with base URL set to backend API
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
});

// Add token to headers if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Exports the configured Axios instance for use in the app
 */
export default API;
// client/src/api/api.js
// This file sets up the API client for backend communication
