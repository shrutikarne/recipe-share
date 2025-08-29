/**
 * Token management utility for handling authentication with HTTP-only cookies
 * When using HTTP-only cookies, we don't have direct access to the token via JavaScript,
 * so we need to adapt our approach to work with the server's cookie handling.
 */

/**
 * Check if the user is authenticated (based on session state)
 * This is a simplified way to track authentication status when using HTTP-only cookies
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return sessionStorage.getItem("isAuthenticated") === "true";
};

/**
 * Mark the user as authenticated in session storage
 * @param {string} userId - User ID to store (optional)
 * @param {number} expiresInMinutes - Minutes until token expiry (optional)
 */
export const setAuthenticated = (userId = null, expiresInMinutes = 30) => {
  sessionStorage.setItem("isAuthenticated", "true");
  if (userId) {
    sessionStorage.setItem("userId", userId);
  }
  calculateTokenExpiry(expiresInMinutes);
};

/**
 * Mark the user as logged out in session storage
 */
export const setLoggedOut = () => {
  sessionStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("tokenExpiry");
};

/**
 * Get the user ID from session storage
 * @returns {string|null} The user ID or null if not found
 */
export const getUserId = () => sessionStorage.getItem("userId");

/**
 * Set the token expiry timestamp in session storage
 * We still need this for front-end refresh decisions
 * @param {number} expiryTime - Timestamp when token expires
 */
export const setTokenExpiry = (expiryTime) => {
  sessionStorage.setItem("tokenExpiry", expiryTime.toString());
};

/**
 * Get the token expiry timestamp from session storage
 * @returns {number|null} The token expiry timestamp or null if not found
 */
export const getTokenExpiry = () => {
  const expiry = sessionStorage.getItem("tokenExpiry");
  return expiry ? parseInt(expiry) : null;
};

/**
 * Calculate token expiry time from minutes until expiry
 * @param {number} expiresInMinutes - Minutes until token expiry
 * @returns {number} Timestamp when token expires
 */
export const calculateTokenExpiry = (expiresInMinutes = 30) => {
  const expiryTime = Date.now() + (expiresInMinutes * 60 * 1000);
  setTokenExpiry(expiryTime);
  return expiryTime;
};

/**
 * Check if the token is expiring soon (within the next 5 minutes)
 * @returns {boolean} Whether the token is expiring soon
 */
export const isTokenExpiringSoon = (thresholdMinutes = 5) => {
  const expiry = getTokenExpiry();
  if (!expiry) return false;

  // Token is expiring in the next X minutes
  const thresholdMs = thresholdMinutes * 60 * 1000;
  return expiry - Date.now() < thresholdMs;
};

/**
 * Check if the token has expired
 * @returns {boolean} Whether the token has expired
 */
export const isTokenExpired = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return false;

  return Date.now() > expiry;
};

/**
 * For backward compatibility with code that expects these functions
 */
export const getToken = () => null;
export const setToken = () => { };
export const removeToken = () => setLoggedOut();
export const parseToken = () => null;
export const getUserFromToken = () => ({
  user: { id: getUserId() }
});
