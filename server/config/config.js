/**
 * Central configuration file for environment variables
 * Use this file to access all environment variables across the application
 */
require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/recipe-share',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-key-change-in-production',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-token-secret-change-in-production',
  SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'default-session-secret-key-change-in-production',

  // Frontend
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // OAuth
  OAUTH: {
    GOOGLE: {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    },
    FACEBOOK: {
      APP_ID: process.env.FACEBOOK_APP_ID,
      APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    }
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    MAX_LOGIN: parseInt(process.env.RATE_LIMIT_MAX_LOGIN || '5'),
    MAX_REGISTER: parseInt(process.env.RATE_LIMIT_MAX_REGISTER || '5'),
    MAX_COMMENT: parseInt(process.env.RATE_LIMIT_MAX_COMMENT || '5'),
    MAX_RECIPE_WRITE: parseInt(process.env.RATE_LIMIT_MAX_RECIPE_WRITE || '10')
  },

  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  },

  // Cookie Configuration
  COOKIE: {
    SECURE: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE || '86400000') // Default: 24 hours
  },

  // JWT Configuration
  JWT: {
    EXPIRATION: process.env.JWT_EXPIRATION || '30m' // Default: 30 minutes
  }
};
