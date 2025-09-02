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
      // Find user by email (normalized)
      let user = await User.findOne({ email });

      // Fallback: case-insensitive lookup for legacy records
      if (!user) {
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const ciEmail = new RegExp(`^${escapeRegex(email)}$`, 'i');
        user = await User.findOne({ email: ciEmail });
      }

      if (!user) {
        if (config.NODE_ENV !== 'production') {
          return res.status(401).json({ msg: "Invalid credentials", reason: 'user_not_found' });
        }
        return res.status(401).json({ msg: "Invalid credentials" });
      }

      // Compare provided password with hashed password
      let isMatch = false;
      const xss = require('xss');

      // 1) Raw password
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        isMatch = false;
      }

      // 2) Trimmed password (handles accidental spaces)
      if (!isMatch && typeof password === 'string' && password.trim() !== password) {
        try {
          isMatch = await bcrypt.compare(password.trim(), user.password);
        } catch (e) { /* ignore */ }
      }

      // 3) Sanitized password (compat for historical sanitization)
      if (!isMatch) {
        const sanitizedPwd = xss(password);
        if (sanitizedPwd !== password) {
          try {
            isMatch = await bcrypt.compare(sanitizedPwd, user.password);
          } catch (e) { /* ignore */ }
        }
      }

      // 4) Sanitized + trimmed
      if (!isMatch) {
        const sanitizedTrimmed = xss(password).trim();
        if (sanitizedTrimmed !== password) {
          try {
            isMatch = await bcrypt.compare(sanitizedTrimmed, user.password);
          } catch (e) { /* ignore */ }
        }
      }

      // 5) Legacy plaintext password migration
      if (!isMatch) {
        const looksHashed = typeof user.password === 'string' && /^\$2[aby]\$\d{2}\$/.test(user.password);
        const candidates = [password, typeof password === 'string' ? password.trim() : password, xss(password), xss(password).trim()].filter(v => typeof v === 'string');
        const matchedPlain = !looksHashed && candidates.some(v => v === user.password);

        if (matchedPlain) {
          // Migrate: hash the provided raw password (not sanitized) and save
          const salt = await bcrypt.genSalt(10);
          const newHash = await bcrypt.hash(password, salt);
          user.password = newHash;
          await user.save();
          isMatch = true;
        }
      }

      if (!isMatch) {
        if (config.NODE_ENV !== 'production') {
          return res.status(401).json({ msg: "Invalid credentials", reason: 'password_mismatch' });
        }
        return res.status(401).json({ msg: "Invalid credentials" });
      }

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

/**
 * @route   POST /api/auth/dev-reset-password
 * @desc    Development-only: reset a user's password by email
 * @access  Public in non-production (guarded by NODE_ENV)
 */
// Register dev-only password reset route only in non-production
if (config.NODE_ENV !== 'production') {
  router.post("/dev-reset-password",
    validateRequiredFields(['email', 'newPassword']),
    sanitizeBody({ email: sanitizeEmail }),
    async (req, res) => {
      try {
        // Extra guard (defense-in-depth)
        if (config.NODE_ENV === 'production') {
          return res.status(403).json({ msg: 'Not available in production' });
        }

        const { email, newPassword } = req.body;

        // Case-insensitive email lookup
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const ciEmail = new RegExp(`^${escapeRegex(email)}$`, 'i');
        const user = await User.findOne({ email: ciEmail });

        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }

        // Validate password using same server-side validator
        const pwdValidation = validatePassword(newPassword);
        if (pwdValidation !== true) {
          return res.status(400).json({ msg: pwdValidation });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.json({ success: true, msg: 'Password reset. Please login.' });
      } catch (err) {
        return res.status(500).json({ msg: 'Server error' });
      }
    }
  );
}

module.exports = router;

