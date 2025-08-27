/**
 * Main server entry point for the Recipe Share backend
 * Sets up Express app, middleware, routes, and database connection
 */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import DB connection
const passport = require("./config/passport");
const session = require("express-session");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors({
  origin: true,
  credentials: true,
}));

// Session middleware (required for passport, even if not using sessions for JWT)
app.use(session({
  secret: process.env.JWT_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

// Parse incoming JSON requests
app.use(express.json());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Register authentication, recipe, and user routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/recipes", require("./routes/recipes"));
app.use("/api/user", require("./routes/user"));

// Connect to MongoDB database
connectDB();

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

module.exports = app;
