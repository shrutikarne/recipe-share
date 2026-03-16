# Quick Start - Personal Recipe Website

## Setup Steps

### 1. Update Environment Variables

Create/update `.env` in the server directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/recipe-share
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
ADMIN_PASSWORD=admin123
```

**⚠️ IMPORTANT**: Change `ADMIN_PASSWORD` to something secure!

### 2. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 4. Start Backend

```bash
cd server
npm start
# Server runs at http://localhost:5000
```

### 5. Start Frontend

```bash
cd client
npm start
# Frontend runs at http://localhost:3000
```

## First Time Setup

1. **Open the app**: http://localhost:3000
2. **Go to Admin Login**:
   - Click avatar dropdown → "Admin"
   - Enter password from `ADMIN_PASSWORD` env var (default: `admin123`)
3. **Add your first recipe**:
   - Click "Add Recipe" in navbar
   - Fill in details
   - For images, use direct URLs (e.g., from Unsplash, Pixabay, etc.)
   - Submit!
4. **View as visitor**:
   - Logout from admin
   - Home page shows your recipe publicly!

## Testing the API

### Login as Admin:
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGc..."
}
```

### Create a Recipe:
```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pasta Carbonara",
    "description": "Classic Italian pasta",
    "ingredients": ["pasta", "eggs", "bacon"],
    "steps": ["Cook pasta", "Mix eggs", "Combine"],
    "category": "Italian",
    "cookTime": 20
  }'
```

### View All Recipes (No Auth):
```bash
curl http://localhost:5000/api/recipes
```

## Key Files Changed

**Server:**
- `server/routes/admin-auth.js` - NEW: Admin authentication
- `server/routes/recipes.js` - UPDATED: Public GET, admin-only write
- `server/models/Recipe.js` - UPDATED: Simplified schema
- `server/middleware/adminAuth.js` - NEW: Admin middleware
- `server/config/config.js` - UPDATED: Added ADMIN_PASSWORD

**Client:**
- `client/src/App.js` - UPDATED: Removed auth routes, added admin panel
- `client/src/pages/admin/AdminPanel.js` - NEW: Admin login page
- `client/src/components/Navbar.js` - UPDATED: Admin instead of user profile
- `client/src/api/api.js` - UPDATED: Admin token support

## Troubleshooting

### "Admin access required" error:
- Make sure you're logged in: avatar dropdown → "Admin"
- Enter correct password from `ADMIN_PASSWORD`

### Recipes not showing:
- Check MongoDB is running
- Verify `MONGO_URI` in `.env`

### API connection error:
- Check backend is running on correct port
- Verify `CLIENT_URL` in server `.env`

### Image not loading:
- Use complete URL (https://...)
- Not a relative path like `/images/pic.jpg`

## Next Steps

1. **Add more recipes** via Admin panel
2. **Customize** category, tags, dietary options in your recipes
3. **Share** http://localhost:3000 with friends
4. **Deploy** to production (Netlify, Vercel for frontend; Heroku, Railway for backend)

For deployment help, see the main README.md

Enjoy! 🍳
