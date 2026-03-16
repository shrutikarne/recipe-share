/**
 * Admin Authentication routes for Recipe Share
 * Simplified authentication for single admin user managing recipes
 * Anyone can read recipes, only admin can create/update/delete
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const router = express.Router();

// Rate limiter for admin login
const adminLoginLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_LOGIN,
  message: {
    msg: "Too many login attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin and return a JWT token
 * @access  Public
 */
router.post("/login", adminLoginLimiter, (req, res) => {
  const { password } = req.body;

  try {
    // Simple password check
    if (!password) {
      return res.status(400).json({ msg: "Password is required" });
    }

    // Check admin password
    if (password !== config.ADMIN_PASSWORD) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const payload = { admin: true };
    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT.EXPIRATION,
    });

    res.json({
      success: true,
      token,
      expiresIn: parseInt(config.JWT.EXPIRATION) || 30
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   POST /api/admin/logout
 * @desc    Logout admin by clearing the token cookie
 * @access  Private
 */
router.post("/logout", (req, res) => {
  // Stateless tokens: client simply discards the token.
  res.json({ success: true, message: "Logged out successfully" });
});

/**
 * @route   GET /api/admin/verify
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.admin) {
      return res.json({ success: true, admin: true });
    }
    return res.status(401).json({ msg: "Invalid token" });
  } catch (err) {
    return res.status(401).json({ msg: "Token expired or invalid" });
  }
});

module.exports = router;
