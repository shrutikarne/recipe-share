/**
 * Main server entry point for the Recipe Share backend
 * Sets up Express app, middleware, routes, and database connection
 */
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import DB connection

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

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
