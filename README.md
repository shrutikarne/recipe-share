# Recipe Share

Recipe Share is a lean MERN application for publishing your personal recipes. Visitors can browse everything publicly, and only you (the site owner) can log in with a single admin password to add, update, or delete recipes.

## Highlights
- Browse recipes with search plus category/diet filters.
- View rich recipe detail pages with ingredient scaling, cook/prep times, and image galleries.
- A single password-protected admin panel lets you manage recipes; everyone else only reads.
- Hardened backend with input sanitisation, structured validation, rate limiting, and security headers.

## Architecture at a Glance
| Layer    | Location | Overview |
|----------|----------|----------|
| Frontend | `client/` | React 19 application (CRA) with React Router v7, Framer Motion animations, SCSS modules, and a token-aware Axios client. |
| Backend  | `server/` | Express 5 API with MongoDB/Mongoose models, JWT admin authentication, recipe routes, and URL-based media links. |

## Tech Stack
- **Frontend:** React 19, React Router, React Testing Library, Playwright, Sass, Framer Motion, Axios
- **Backend:** Node.js 18+, Express 5, Mongoose, JWT, express-rate-limit, Helmet
- **Data & Storage:** MongoDB (recipe data + remote image URLs)
- **Tooling:** Jest + Supertest, Playwright, ESLint (CRA defaults)

## Prerequisites
- Node.js 18 or newer (check with `node -v`)
- npm 9+ or yarn
- Running MongoDB instance (local or connection string)

## Setup
1. **Install dependencies**
   ```bash
   # Frontend
   cd client
   npm install

   # Backend
   cd ../server
   npm install
   ```

2. **Configure environment variables**
   - Create `server/.env`:
     ```ini
     PORT=5000
     NODE_ENV=development
     MONGO_URI=mongodb://localhost:27017/recipe-share

     JWT_SECRET=dev-jwt-secret-change-me
     ADMIN_PASSWORD=super-secret-change-me

     CLIENT_URL=http://localhost:3000
     CORS_ORIGIN=http://localhost:3000

     # Uploaded recipe images are saved under server/uploads/recipes
     ```
   - Create `client/.env`:
     ```ini
     REACT_APP_API_URL=http://localhost:5000
     ```

3. **(Optional)** populate MongoDB with sample data or create accounts via the UI.

## Running Locally
Open two terminals so the backend and frontend keep running:
```bash
# Terminal 1 - API
cd server
npm run dev          # same as npm start; runs Express on :5000

# Terminal 2 - Web app
cd client
npm start            # CRA dev server on :3000 with proxy to :5000
```

The frontend proxies API calls to the backend (see `client/package.json` -> `proxy`).

## Testing
Refer to `TESTING.md` for the full matrix. Common commands:
```bash
# Backend (Jest + Supertest)
cd server
npm test             # run suite
npm run test:coverage

# Frontend (React Testing Library)
cd client
npm test
npm run test:coverage

# End-to-end (Playwright)
cd client
npm run test:e2e
```
Playwright expects the dev servers running or a deployed URL (configure via `PLAYWRIGHT_BASE_URL`).

## Useful Scripts
| Location | Command | Purpose |
|----------|---------|---------|
| `server` | `npm start` | Start Express API on configured port. |
| `server` | `npm run dev` | Alias for `npm start` (use nodemon if you prefer hot reload). |
| `server` | `npm test` | Run server-side Jest suite. |
| `client` | `npm start` | Launch CRA dev server with React fast refresh. |
| `client` | `npm run build` | Create production build in `client/build`. |

## Project Structure
```
recipe-share/
├── client/                 # React app (components, pages, API helpers)
│   ├── src/
│   │   ├── api/            # Axios instance + recipe/autocomplete clients
│   │   ├── components/     # Navbar, recipe grid, shared UI
│   │   ├── pages/          # Home, Admin, Add Recipe, Recipe Detail, About
│   │   └── utils/          # Sanitizers, toast config, image helpers
├── server/                 # Express API
│   ├── config/             # Env wrapper, DB connection
│   ├── middleware/         # Validation, sanitisation, security helpers
│   ├── models/             # Mongoose models for Recipe
│   └── routes/             # Admin auth + recipes
├── assets/                 # Shared assets (images, icons)
└── TESTING.md              # Detailed testing reference
```

## API Overview
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/verify` – password-only admin login for the owner.
- `GET /api/recipes` + query params for search/filter/pagination; `POST /api/recipes` (admin), `PUT/DELETE /api/recipes/:id` for owner-managed CRUD.
- `GET /api/recipes/:id` for recipe details (public).

## Configuration Notes
- Admin JWTs are stored in `localStorage` as `adminToken` and automatically attached to requests in `client/src/api/api.js`.
- Server-side validation lives in `server/middleware/validation.js` and `server/middleware/recipeValidation.js`. Adjust these when the data model changes.
- Security middleware (Helmet, sanitisation, rate limiting) is wired in `server/server.js`; tweak policies there if you integrate additional clients.

---
Need more detail on endpoints or deployment? Check the source tree or open an issue.
