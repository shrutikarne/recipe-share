# Recipe Share

Recipe Share is a modern, full-stack web application for discovering, creating, and sharing recipes. The project is in active development. Core features like authentication, recipe CRUD, and a responsive UI are implemented. Automated tests for both frontend and backend are in place, with coverage expanding as new features are added.

---

## 🚀 Features (as of August 2025)

- **User authentication** (register, login, JWT-protected routes)
- **Recipe CRUD** (add, edit, delete, view, search)
- **Responsive, accessible UI** (WCAG-compliant, keyboard navigation, ARIA roles)
- **Recipe details, quick preview modals, and story view**
- **Category tiles, featured carousel, editor's picks, and dark mode toggle**
- **Automated testing:**
	- Playwright for end-to-end (E2E) frontend tests (see `client/tests/`)
	- Jest for backend API, models, and middleware (see `server/tests/`)
- **Modern developer workflow:**
	- Modular React and Express codebase
	- API error handling and in-page feedback
	- Environment-based configuration
	- SCSS modules for component styling

---

## 🛠️ Tech Stack

- **Frontend:** React (client/), Playwright (E2E)
- **Backend:** Node.js, Express (server/), Jest (unit/integration)
- **Database:** MongoDB (Mongoose ODM)

---

## 🧪 Testing

- **Frontend:**
	- Playwright E2E tests for all major user flows in `client/tests/`.
	- Run with:
		```bash
		cd client
		npx playwright test
		```
- **Backend:**
	- Jest tests for API routes, models, and middleware in `server/tests/`.
	- Run with:
		```bash
		cd server
		npm test
		```

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or Atlas)

### Installation
1. **Clone the repository:**
		```bash
		git clone https://github.com/shrutikarne/recipe-share.git
		cd recipe-share
		```
2. **Install dependencies:**
		- For the client:
			```bash
			cd client
			npm install
			```
		- For the server:
			```bash
			cd ../server
			npm install
			```
3. **Configure environment variables:**
		- Create a `.env` file in `server/` with your MongoDB URI and JWT secret.
4. **Run the app:**
		- Start backend:
			```bash
			cd server
			npm start
			```
		- Start frontend:
			```bash
			cd ../client
			npm start
			```

---

## 📁 Folder Structure (as of August 2025)

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

---

---

## 🚧 Project Status & Next Steps

- Core features are implemented and tested.
- UI/UX improvements and new features are in progress.
- Test coverage is expanding as new components and routes are added.
- Feedback and contributions are welcome!

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## 📝 License
MIT License
