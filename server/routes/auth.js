/**
 * Authentication routes for user registration and login
 * Handles creating new users and issuing JWT tokens
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
// Rate limiter for login route (e.g., max 5 requests per minute per IP)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    msg: "Too many login attempts from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration route (e.g., max 5 requests per minute per IP)
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
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
    // Issue JWT and redirect to frontend with token
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30m" });
    // Redirect to frontend with token in query param (or set cookie)
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/auth/social?token=${token}`);
  }
);

// --- Facebook OAuth ---
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/?error=facebook" }),
  (req, res) => {
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30m" });
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/auth/social?token=${token}`);
  }
);
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");
const User = require("../models/User");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return a JWT token
 * @access  Public
 */
router.post("/register", registerLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Name, email, and password are required" });
  }

  // Validate email is a string and matches a safe email pattern
  if (
    typeof email !== "string" ||
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

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
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m", // 30 minutes
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
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Validate email is a string and matches a safe email pattern
  if (
    typeof email !== "string" ||
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    // Create JWT payload and sign token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m", // 30 minutes
    });

    // Return the token
    res.json({ token });
  } catch (err) {
    // Log and return server error
    console.error(err && err.message ? err.message : err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
// server/routes/auth.js
// This file contains authentication routes for registration and login
