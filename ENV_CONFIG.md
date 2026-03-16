# Environment Variables Configuration

## Server (.env file in `/server` directory)

### Required Variables
```env
# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb://localhost:27017/recipe-share

# Admin Authentication
ADMIN_PASSWORD=admin123

# Security Keys (MUST change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-super-secret-session-key-change-this

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Optional Variables (with defaults)
```env
# Rate Limiting (milliseconds)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_LOGIN=5
RATE_LIMIT_MAX_REGISTER=5
RATE_LIMIT_MAX_COMMENT=5
RATE_LIMIT_MAX_RECIPE_WRITE=10

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Cookie Security
COOKIE_SECURE=false
COOKIE_MAX_AGE=86400000

# Token Expiration
JWT_EXPIRATION=30m
```

---

## Client (.env file in `/client` directory)

### Optional Variables
```env
# API Backend URL (optional, defaults to http://localhost:5000)
REACT_APP_API_URL=http://localhost:5000
```

---

## Production Example

### Server (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database - Use MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-share

# Admin - CHANGE THIS!
ADMIN_PASSWORD=very-secure-password-32-characters-long

# Security - Generate random strings
JWT_SECRET=aB3dEf9Gh1jKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQr
SESSION_SECRET=zY9xWvUtSrQpOnMlKjIhGfEdCbAz9yXwVuTsRqPoNmLkJ

# Frontend URL
CLIENT_URL=https://yourdomain.com

# Security Settings
COOKIE_SECURE=true
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting (adjust based on expected traffic)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_LOGIN=10
RATE_LIMIT_MAX_RECIPE_WRITE=20
```

### Client (.env)
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Environment Variables Explained

### PORT
- **What**: Port number the server listens on
- **Default**: 5000
- **Example**: 8000, 3000
- **Note**: Production should use port 80/443 via reverse proxy

### NODE_ENV
- **What**: Application environment mode
- **Default**: development
- **Values**: development, production, test
- **Effect**: Disables verbose errors in production

### MONGO_URI
- **What**: MongoDB connection string
- **Local**: `mongodb://localhost:27017/recipe-share`
- **Atlas**: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- **Docker**: `mongodb://mongo:27017/recipe-share`
- **Atlas Guide**: https://docs.atlas.mongodb.com/driver-connection/

### ADMIN_PASSWORD
- **What**: Password for admin login (THIS IS CRITICAL!)
- **Default**: admin123 (CHANGE IN PRODUCTION!)
- **Rules**: 
  - Use strong password (12+ chars, mix of upper/lower/numbers/symbols)
  - Store securely in password manager
  - Never commit to git
  - Change regularly
- **Example**: `P@ssw0rd!MyRecipe$2024`

### JWT_SECRET
- **What**: Secret key for signing JWT tokens
- **Default**: default-jwt-secret-key-change-in-production
- **Rules**:
  - MUST change in production
  - Use strong random string (32+ chars)
  - Keep confidential
  - Never commit to git
- **Generate**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### SESSION_SECRET
- **What**: Secret for session management
- **Default**: Falls back to JWT_SECRET
- **Rules**: Same as JWT_SECRET
- **Generate**: Same as JWT_SECRET

### CLIENT_URL
- **What**: Frontend URL for CORS and redirects
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`
- **Important**: Must match actual frontend domain

### RATE_LIMIT_WINDOW_MS
- **What**: Time window for rate limiting (milliseconds)
- **Default**: 60000 (1 minute)
- **Values**: 60000, 300000 (5m), 600000 (10m)
- **Note**: Lower = stricter rate limiting

### RATE_LIMIT_MAX_LOGIN
- **What**: Max login attempts per IP per window
- **Default**: 5
- **Suggestion**: 10-20 for production
- **Note**: Prevents brute force attacks

### RATE_LIMIT_MAX_RECIPE_WRITE
- **What**: Max recipe create/update/delete per IP per window
- **Default**: 10
- **Suggestion**: 20-50 for production
- **Note**: One user shouldn't exceed this in normal use

### CORS_ORIGIN
- **What**: Allowed origins for API requests
- **Development**: `http://localhost:3000,http://localhost:3001`
- **Production**: `https://yourdomain.com`
- **Multiple**: Separate with comma
- **Array Format**: `["https://yourdomain.com", "https://www.yourdomain.com"]`

### COOKIE_SECURE
- **What**: Enable HTTPS-only cookies
- **Development**: false (local development)
- **Production**: true (HTTPS only)
- **Effect**: Cookies only sent over HTTPS

### COOKIE_MAX_AGE
- **What**: How long cookie is valid (milliseconds)
- **Default**: 86400000 (24 hours)
- **1 week**: 604800000
- **30 days**: 2592000000
- **Note**: JWT token may expire sooner

### JWT_EXPIRATION
- **What**: How long JWT token is valid
- **Default**: 30m (30 minutes)
- **Values**: "15m", "1h", "7d", "30m"
- **Note**: Shorter = more secure, longer = less refreshes

### REACT_APP_API_URL (Client)
- **What**: Backend API URL for frontend
- **Development**: `http://localhost:5000`
- **Production**: `https://api.yourdomain.com`
- **Note**: Optional, defaults to same domain

---

## Security Best Practices

### 1. Generation of Secrets
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. .gitignore Entries
```
.env
.env.local
.env.*.local
.env.production
```

### 3. Environment Setup
```bash
# Never do this:
export ADMIN_PASSWORD=secret  # Visible in shell history!
set ADMIN_PASSWORD=secret     # Visible in environment!

# Use .env file instead:
# Create .env and add variables
# Never commit to git
# Access via process.env
```

### 4. Production Deployment
- Use platform's secret management:
  - Heroku: Config Vars
  - AWS: Secrets Manager
  - Railway: Variables
  - Vercel/Netlify: Environment Variables
  - Docker: Docker Secrets

### 5. Rotation
- **ADMIN_PASSWORD**: Change quarterly
- **JWT_SECRET**: Change when security audit done
- **Both**: Change after any breach

### 6. Backup
```bash
# Backup production .env (encrypted)
gpg --symmetric .env.production

# Store encrypted backup securely (1Password, LastPass, etc.)
# Keep recovery key separate from .env file
```

---

## Troubleshooting

### Connection Issues
```bash
# Check MongoDB
mongosh mongodb://localhost:27017

# Check environment variables are loaded
console.log(process.env.ADMIN_PASSWORD)

# Check CORS
curl -H "Origin: http://localhost:3000" http://localhost:5000/api/recipes
```

### Token Issues
```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Verify token (development only)
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.verify('TOKEN', process.env.JWT_SECRET))"
```

### Rate Limiting
```bash
# Test rate limiting
for i in {1..10}; do curl http://localhost:5000/api/recipes; done
# Should get 429 (Too Many Requests) after max hits
```

---

## Migration from Production

When moving environments:

1. **Generate new secrets** (don't copy from dev)
2. **Update MONGO_URI** to production database
3. **Update CLIENT_URL** to production domain
4. **Update CORS_ORIGIN** to production domain
5. **Set NODE_ENV=production**
6. **Enable COOKIE_SECURE=true**
7. **Review all rate limiting values**
8. **Test admin login** with new password
9. **Monitor logs** for first 24 hours

---

## Docker Example

If using Docker, create `.env.docker`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/recipe-share
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-key
CLIENT_URL=http://localhost:3000
COOKIE_SECURE=false
```

Then in `docker-compose.yml`:
```yaml
services:
  server:
    env_file: .env.docker
```

---

For more details, see:
- `QUICK_START.md` - Setup guide
- `TRANSFORMATION_GUIDE.md` - Architecture changes
- `CHANGES_SUMMARY.md` - What changed
