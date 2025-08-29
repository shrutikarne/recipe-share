/**
 * Authentication routes for user registration and login
 * Handles creating new users and issuing JWT tokens
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
// Import validation middleware
const {
  validateRequiredFields,
  validateFields,
  sanitizeBody,
  validateEmail,
  validatePassword,
  validateName,
  sanitizeEmail,
  sanitizeString
} = require("../middleware/validation");

const config = require("../config/config");

// Rate limiter for login route
const loginLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_LOGIN,
  message: {
    msg: "Too many login attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration route
const registerLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REGISTER,
  message: {
    msg: "Too many registration attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const router = express.Router();
const passport = require("../config/passport");
// --- Google OAuth ---
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/?error=google" }),
  (req, res) => {
    // Issue JWT and set as cookie
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT.EXPIRATION });
    // Set the token as HTTP-only cookie
    setTokenCookie(res, token);
    // Redirect to frontend without token in query param
    res.redirect(`${config.CLIENT_URL}/auth/social?success=true`);
  }
);

// --- Facebook OAuth ---
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/?error=facebook" }),
  (req, res) => {
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT.EXPIRATION });
    // Set the token as HTTP-only cookie
    setTokenCookie(res, token);
    res.redirect(`${config.CLIENT_URL}/auth/social?success=true`);
  }
);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken, setTokenCookie, clearTokenCookie } = require("../middleware/auth");
const User = require("../models/User");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return a JWT token
 * @access  Public
 */
router.post("/register",
  registerLimiter,
  validateRequiredFields(['name', 'email', 'password']),
  validateFields({
    name: validateName,
    email: validateEmail,
    password: validatePassword
  }),
  sanitizeBody({
    name: sanitizeString,
    email: sanitizeEmail
  }),
  async (req, res) => {
    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create and save the new user
      user = new User({ name, email, password: hashedPassword });
      await user.save();

      // Create JWT payload and sign token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT.EXPIRATION,
      });

      // Return the token
      res.json({ token });
    } catch (err) {
      // Log and return server error
      console.error(err && err.message ? err.message : err);
      res.status(500).send("Server error");
    }
  });

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return a JWT token
 * @access  Public
 */
router.post("/login",
  loginLimiter,
  validateRequiredFields(['email', 'password']),
  validateFields({
    email: validateEmail,
    password: (password) => typeof password === 'string' ? true : 'Password must be a string'
  }),
  sanitizeBody({
    email: sanitizeEmail
  }),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ msg: "Invalid credentials" });

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

      // Create JWT payload and sign token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: config.JWT.EXPIRATION,
      });

      // Set the token as HTTP-only cookie
      setTokenCookie(res, token);

      // Return success without the token in the body
      res.json({
        success: true,
        userId: user.id,
        expiresIn: parseInt(config.JWT.EXPIRATION) || 30
      });
    } catch (err) {
      // Log and return server error
      console.error(err && err.message ? err.message : err);
      res.status(500).send("Server error");
    }
  });

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token before expiration
 * @access  Private (requires valid token)
 */
router.post("/refresh", verifyToken, async (req, res) => {
  try {
    // Get user id from verified token
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    // Find the user to ensure they still exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Create a new token with a fresh expiration time
    const payload = { user: { id: userId } };
    const newToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT.EXPIRATION,
    });

    // Set the new token as HTTP-only cookie
    setTokenCookie(res, newToken);

    // Return success without the token in the body
    res.json({
      success: true,
      expiresIn: parseInt(config.JWT.EXPIRATION) || 30
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by clearing the cookie
 * @access  Public
 */
router.post("/logout", (req, res) => {
  // Clear the token cookie
  clearTokenCookie(res);

  // Return success
  res.json({ success: true, msg: "Logged out successfully" });
});

module.exports = router;
// server/routes/auth.js
// This file contains authentication routes for registration and login
