// Authentication middleware using HTTP-only cookies
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Verify JWT token from cookie
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
function verifyToken(req, res, next) {
  // Get token from cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "No token found, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Check token payload structure
    if (!decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    // Set the user in the request
    req.user = decoded.user;
    next();
  } catch (err) {

    // Provide specific error messages for different error types
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: "Token has expired", expired: true });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: "Invalid token" });
    }

    res.status(401).json({ msg: "Token validation failed" });
  }
}

/**
 * Set JWT token as HTTP-only cookie
 * @param {object} res - Express response object
 * @param {string} token - JWT token to set as cookie
 * @param {number} maxAge - Cookie max age in milliseconds (optional)
 */
function setTokenCookie(res, token, maxAge = config.COOKIE.MAX_AGE) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.COOKIE.SECURE,
    sameSite: 'lax', // Use 'strict' in production
    maxAge: maxAge,
    path: '/'
  });
}

/**
 * Clear the authentication cookie
 * @param {object} res - Express response object
 */
function clearTokenCookie(res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.COOKIE.SECURE,
    sameSite: 'lax', // Use 'strict' in production
    path: '/'
  });
}

module.exports = { verifyToken, setTokenCookie, clearTokenCookie };
