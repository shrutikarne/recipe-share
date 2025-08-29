/**
 * Main server entry point for the Recipe Share backend
 * Sets up Express app, middleware, routes, and database connection
 */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const config = require("./config/config"); // Import central config
const connectDB = require("./config/db"); // Import DB connection
const passport = require("./config/passport");
const session = require("express-session");
const { sanitizeRequests } = require("./middleware/sanitization");
const {
  secureHeaders,
  preventParamPollution,
  limitJsonPayload
} = require("./middleware/security");

const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors({
  origin: function(origin, callback) {
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

// Session middleware (required for passport, even if not using sessions for JWT)
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.COOKIE.SECURE,
    maxAge: config.COOKIE.MAX_AGE
  },
}));

// Parse incoming JSON requests
app.use(express.json());

// Add cookie parser middleware
app.use(cookieParser());

// Apply security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com", "https://*.googleusercontent.com"],
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

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Register authentication, recipe, and user routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/recipes", require("./routes/recipes"));
app.use("/api/user", require("./routes/user"));

// Connect to MongoDB database
connectDB();

if (require.main === module) {
  app.listen(config.PORT, () =>
    console.log(`Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`)
  );
}

module.exports = app;
