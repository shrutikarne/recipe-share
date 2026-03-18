/**
 * Main server entry point for the Recipe Share backend
 * Sets up Express app, middleware, routes, and database connection
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const config = require("./config/config"); // Import central config
const connectDB = require("./config/db"); // Import DB connection
const { sanitizeRequests } = require("./middleware/sanitization");
const {
  secureHeaders,
  preventParamPollution,
  limitJsonPayload
} = require("./middleware/security");

const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = Array.isArray(config.CORS.ORIGIN)
      ? config.CORS.ORIGIN
      : [config.CORS.ORIGIN];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
}));

// Parse incoming JSON requests
app.use(express.json());

const imgSrcDirectives = [
  "'self'",
  "data:",
  "https://storage.googleapis.com",
  "https://*.googleusercontent.com"
];

// Apply security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: imgSrcDirectives,
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  },
  // These settings can be adjusted based on your app's needs
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply XSS sanitization to all requests
app.use(sanitizeRequests);

// Apply additional security middleware
app.use(secureHeaders);
app.use(preventParamPollution);
app.use(limitJsonPayload('2mb'));  // Limit payload size to 2MB

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register admin authentication and recipe routes
app.use("/api/admin", require("./routes/admin-auth"));
app.use("/api/recipes", require("./routes/recipes"));
app.use("/api/uploads", require("./routes/uploads"));

// Connect to MongoDB database
connectDB();

if (require.main === module) {
  app.listen(config.PORT);
}

module.exports = app;
