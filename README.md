# Recipe Share

Recipe Share is a modern, full-stack web application for discovering, creating, and sharing recipes. This platform enables users to explore, create, save, and share culinary creations with a vibrant community of food enthusiasts. With an intuitive interface and robust feature set, Recipe Share makes cooking and meal planning a delightful experience.

## 📑 Table of Contents

- [Features](#-features-as-of-september-2025)
- [Tech Stack](#️-tech-stack)
- [Testing](#-testing)
- [Getting Started](#-getting-started)
- [Folder Structure](#-folder-structure-as-of-august-2025)
- [Project Status & Roadmap](#-project-status--roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features (as of September 2025)

- **User Experience:**
  - Intuitive, responsive UI design optimized for all device sizes
  - Accessibility-compliant interface (WCAG 2.1 AA standard)

- **User Management:**
  - Secure authentication (register, login, password reset)
  - JWT-based authorization with token refresh
  - Customizable user profiles with avatars and favorite recipes
  - Social authentication options (Google, Facebook)

- **Recipe Management:**
  - Comprehensive CRUD operations (create, read, update, delete)
  - Rich text recipe editor with image uploads
  - Ingredient management with automatic unit conversion
  - Cooking time and difficulty indicators

- **Discovery & Organization:**
  - Smart search with autocomplete and filters
  - Category browsing with visual tiles
  - Featured recipes carousel and editor's picks
  - Recipe collections and favorites

- **Social Features:**
  - Recipe ratings and reviews
  - Recipe sharing via social media
  - User following and activity feed

- **Quality Assurance:**
  - Comprehensive E2E tests with Playwright (frontend)
  - API and model tests with Jest (backend)
  - CI/CD pipeline integration

- **Developer Experience:**
  - Modular, well-documented codebase
  - Consistent error handling and user feedback
  - Environment-based configuration
  - Component-scoped styling with SCSS modules

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with functional components and hooks
- **State Management:** Context API, React Query for remote state
- **Styling:** SCSS modules, responsive design principles
- **Testing:** Playwright for E2E testing, React Testing Library for component tests
- **Build Tools:** Webpack 5, Babel, PostCSS

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Authentication:** JWT, Passport.js
- **Validation:** Express-validator, Joi
- **Testing:** Jest, Supertest for API testing

### Database
- **Primary Database:** MongoDB with Mongoose ODM
- **Media Storage:** AWS S3 for image uploads
- **Caching:** Redis (for session storage and API caching)

### DevOps
- **Version Control:** Git, GitHub
- **CI/CD:** GitHub Actions
- **Deployment:** Docker containers, AWS

---

## 🧪 Testing

Recipe Share includes comprehensive testing at multiple levels to ensure reliability and stability.

### Frontend Testing

- **End-to-End Tests:** 
  - Located in `client/tests/`
  - Powered by Playwright for cross-browser testing
  - Tests all major user workflows including authentication, recipe creation, and browsing
  - Run tests with:
    ```bash
    cd client
    npx playwright test
    ```
  - Generate visual test report:
    ```bash
    npx playwright show-report
    ```

### Backend Testing

- **Unit & Integration Tests:**
  - Located in `server/tests/`
  - Powered by Jest and Supertest
  - Tests API endpoints, models, middleware, and authentication flows
  - Run tests with:
    ```bash
    cd server
    npm test
    ```
  - Run with coverage report:
    ```bash
    npm test -- --coverage
    ```

### CI Pipeline

Tests run automatically on pull requests through GitHub Actions. See `.github/workflows` for configuration details.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v8+) or yarn (v1.22+)
- MongoDB (v5+, local installation or MongoDB Atlas)
- AWS account (for S3 image storage)
- Redis (optional, for enhanced caching)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shrutikarne/recipe-share.git
   cd recipe-share
   ```

2. **Install dependencies:**
   
   Using npm:
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```
   
   Or using yarn:
   ```bash
   # Install frontend dependencies
   cd client
   yarn install
   
   # Install backend dependencies
   cd ../server
   yarn install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the `server/` directory with the following variables:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/recipe-share
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRATION=7d
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=recipe-share-uploads
   AWS_REGION=us-east-1
   
   # Optional: Redis Configuration
   REDIS_URL=redis://localhost:6379
   ```
   
   Create a `.env` file in the `client/` directory with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Initialize the database:**
   ```bash
   cd server
   npm run seed  # Populates the database with sample data
   ```

5. **Run the application:**
   
   Development mode:
   ```bash
   # Terminal 1 - Start the backend
   cd server
   npm run dev
   
   # Terminal 2 - Start the frontend
   cd client
   npm start
   ```
   
   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

---

## 📁 Folder Structure (as of September 2025)

```
recipe-share/
├── client/         # React frontend (UI, pages, API calls, Playwright tests)
│   ├── public/     # Static assets (HTML, icons, manifest)
│   ├── src/
│   │   ├── api/    # API helpers (api.js, autocomplete.js)
│   │   ├── components/ # Reusable UI components (tiles, carousels, modals, etc.)
│   │   ├── pages/  # Page components (add-recipe, home, authentication, recipe-details)
│   │   └── ...     # Other React files (App.js, index.js, styles)
│   └── tests/      # Playwright E2E tests
├── server/         # Node.js/Express backend (API, models, routes, middleware, Jest tests)
│   ├── config/     # Database config
│   ├── middleware/ # Auth middleware
│   ├── models/     # Mongoose models (User, Recipe)
│   ├── routes/     # API routes (auth, recipes, user)
│   ├── tests/      # Jest tests (auth, recipes, models, middleware)
│   └── ...         # Other backend files (server.js, package.json)
```

## 🚧 Project Status & Roadmap

### Current Status (September 2025)
- ✅ Core platform functionality complete and stable
- ✅ Comprehensive test suite with >85% coverage
- ✅ Mobile-responsive design implemented
- ✅ Recipe management and discovery features operational
- ✅ User authentication and profile system deployed

### Upcoming Features (Q4 2025)
- 🔄 Advanced recipe search with nutritional filters
- 🔄 Recipe API integration with popular third-party services
- 🔄 Mobile app versions (iOS/Android) using React Native
- 🔄 Enhanced analytics and user recommendations

### Future Vision (2026)
- 📝 AI-powered recipe suggestions based on user preferences and pantry inventory
- 📝 Social cooking features with live video integration
- 📝 Premium subscription model with exclusive content
- 📝 Restaurant partnership program

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Contribution Guidelines

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

Please make sure to update tests as appropriate and adhere to the coding standards established in the project.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
