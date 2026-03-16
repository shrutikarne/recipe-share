/**
 * Admin authentication middleware
 * Verifies JWT token and ensures admin access for protected routes
 */
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const verifyAdmin = (req, res, next) => {
  // Get token from cookies or Authorization header
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: "No token provided, admin access required" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    if (!decoded.admin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token expired or invalid" });
  }
};

module.exports = { verifyAdmin };
