# Recipe Share

Recipe Share is a full-stack MERN application for discovering, creating, and managing recipes. The React frontend delivers a polished browsing experience with search, filtering, and rich detail views, while the Express/MongoDB backend powers authentication, recipe CRUD, comments, ratings, and media uploads.

## Highlights
- Browse recipes with full-text search, category and diet filters, and infinite scrolling.
- View rich recipe detail pages with nutrition highlights, comments, ratings, and image galleries.
- Authenticated users can create recipes via a guided multi-step form with client-side validation and image uploads (local disk or S3).
- Save recipes into personal collections, manage your profile, and keep sessions alive with refresh tokens stored in HTTP-only cookies.
- Hardened backend with input sanitisation, structured validation, rate limiting, and security headers.

## Architecture at a Glance
| Layer    | Location | Overview |
|----------|----------|----------|
| Frontend | `client/` | React 19 application (CRA) with React Router v7, Framer Motion animations, SCSS modules, and a token-aware Axios client. |
| Backend  | `server/` | Express 5 API with MongoDB/Mongoose models, JWT cookie authentication + refresh tokens, recipe/comment/user routes, and optional S3 media pipeline. |

## Tech Stack
- **Frontend:** React 19, React Router, React Testing Library, Playwright, Sass, Framer Motion, Axios
- **Backend:** Node.js 18+, Express 5, Mongoose, JWT, bcrypt, Multer, express-rate-limit, Helmet
- **Data & Storage:** MongoDB, optional AWS S3 (toggle via env `USE_S3_UPLOAD=true`)
- **Tooling:** Jest + Supertest, Playwright, ESLint (CRA defaults)

## Prerequisites
- Node.js 18 or newer (check with `node -v`)
- npm 9+ or yarn
- Running MongoDB instance (local or connection string)
- (Optional) AWS account & credentials if you plan to push recipe images to S3

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
     REFRESH_TOKEN_SECRET=dev-refresh-secret-change-me
     SESSION_SECRET=dev-session-secret-change-me

     CLIENT_URL=http://localhost:3000
     CORS_ORIGIN=http://localhost:3000

     # Optional upload settings (set USE_S3_UPLOAD=true to enable S3)
     USE_S3_UPLOAD=false
     AWS_ACCESS_KEY_ID=
     AWS_SECRET_ACCESS_KEY=
     AWS_REGION=us-east-1
     S3_BUCKET_NAME=
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

The frontend proxies API calls to the backend (see `client/package.json` -> `proxy`). Sign up via `/auth` to unlock protected routes like `/add-recipe` and `/profile`.

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
| `client` | `npm run test:e2e` | Execute Playwright tests in `client/tests`. |

## Project Structure
```
recipe-share/
├── client/                 # React app (components, pages, API helpers, tests)
│   ├── src/
│   │   ├── api/            # Axios instance, upload helpers, autocomplete client
│   │   ├── components/     # Navbar, recipe grid, modals, token manager, etc.
│   │   ├── pages/          # Home, Auth, Add Recipe, Recipe Detail, Profile, About
│   │   └── utils/          # Token helpers, sanitizers, toast config
│   └── tests/              # Playwright specs + helpers
├── server/                 # Express API
│   ├── config/             # Env wrapper, DB connection, Passport stubs
│   ├── middleware/         # Auth, validation, sanitisation, security helpers
│   ├── models/             # Mongoose models for User and Recipe
│   ├── routes/             # Auth, recipes, user, uploads, image proxy
│   ├── tests/              # Jest + Supertest suites with MongoDB memory server
│   └── utils/              # S3 upload helper
├── assets/                 # Shared assets (images, icons)
└── TESTING.md              # Detailed testing reference
```

## API Overview
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` – email/password auth with refresh token rotation.
- `GET /api/recipes` + query params for search/filter/pagination; `POST /api/recipes` (auth), `PUT/DELETE /api/recipes/:id` for owner-managed CRUD.
- `GET /api/recipes/:id/comments` and `POST/PUT/DELETE /api/recipes/:id/comments/:commentId` for comment & rating lifecycle.
- `POST /api/user/save/:id`, `POST /api/user/unsave/:id`, `GET /api/user/saved` for personal collections.
- `POST /api/uploads/recipe-image` handles multipart uploads (to local `/uploads/recipes` or S3, depending on env). Use `USE_S3_UPLOAD=true` to opt into S3.

## Configuration Notes
- Authentication tokens are stored in HTTP-only cookies; frontend helpers in `client/src/utils/tokenManager.js` track expiry to trigger refresh.
- Server-side validation lives in `server/middleware/validation.js` and `recipeValidation.js`. Adjust these when the data model changes.
- If enabling Google/Facebook login, update credentials in the env file and re-enable the strategies in `server/config/passport.js`.
- Security middleware (Helmet, sanitisation, rate limiting) is wired in `server/server.js`; tweak policies there if you integrate additional clients.

---
Need more detail on endpoints or deployment? Check the source tree or open an issue.
