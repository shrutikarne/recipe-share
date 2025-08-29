/**
 * Advanced security middleware for Express routes
 * Provides protection against common web application attacks
 */

/**
 * Middleware that enforces strict transport security
 * Redirects HTTP to HTTPS in production
 */
const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    // Redirect to HTTPS
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

/**
 * Middleware that prevents CSRF attacks by validating tokens
 * This is a simplified version - use a proper CSRF library in production
 */
const csrfProtection = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // For other methods, check CSRF token
  const csrfToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['csrf'];

  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }

  next();
};

/**
 * Middleware that sets secure headers for all responses
 */
const secureHeaders = (req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filtering in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Disable caching for sensitive routes
  if (req.path.includes('/api/auth/') || req.path.includes('/api/user/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Middleware that prevents parameter pollution
 * by removing duplicate query parameters
 */
const preventParamPollution = (req, res, next) => {
  if (req.query) {
    const cleanQuery = {};

    // Keep only the last occurrence of each parameter
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        cleanQuery[key] = value[value.length - 1];
      } else {
        cleanQuery[key] = value;
      }
    }

    req.query = cleanQuery;
  }

  next();
};

/**
 * Middleware that limits JSON payload size
 * to prevent DoS attacks
 */
const limitJsonPayload = (maxSize = '1mb') => {
  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');

    if (isJson && req.headers['content-length']) {
      const size = parseInt(req.headers['content-length']);
      const maxBytes = typeof maxSize === 'string'
        ? parseInt(maxSize.replace(/\D/g, '')) * (maxSize.includes('kb') ? 1024 : 1024 * 1024)
        : maxSize;

      if (size > maxBytes) {
        return res.status(413).json({ error: 'Payload too large' });
      }
    }

    next();
  };
};

module.exports = {
  enforceHTTPS,
  csrfProtection,
  secureHeaders,
  preventParamPollution,
  limitJsonPayload
};
