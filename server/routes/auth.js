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
  message: { msg: "Too many login attempts from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration route (e.g., max 5 requests per minute per IP)
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { msg: "Too many registration attempts from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and return a JWT token
 * @access  Public
 */
router.post("/register", registerLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  // Validate email is a string and matches a basic email pattern
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
    console.error(err.message);
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

  // Validate email is a string and matches a basic email pattern
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT payload and sign token
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30m", // 30 minutes
    });

    // Return the token
    res.json({ token });
  } catch (err) {
    // Log and return server error
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
// server/routes/auth.js
// This file contains authentication routes for registration and login
