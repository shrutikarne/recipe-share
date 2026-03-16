/**
 * Sets up a pre-configured Axios instance for API requests to the backend.
 * Only the site owner (admin) needs auth, handled via a JWT stored in localStorage.
 */
import axios from "axios";

const base = process.env.REACT_APP_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${base}/api`,
});

// Attach the admin token (if present) to every request so protected endpoints work.
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default API;
