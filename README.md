# Recipe Share

Recipe Share is a modern, full-stack web application for discovering, creating, and sharing recipes. It features robust authentication, accessibility, and a fully automated test suite for both frontend and backend.

---

## 🚀 Features

- **User authentication** (register, login, JWT-protected routes)
- **Recipe CRUD** (add, edit, delete, view, search)
- **Responsive, accessible UI** (WCAG-compliant, keyboard navigation, ARIA roles)
- **Recipe details, comments, and quick preview modals**
- **Automated testing:**
	- Playwright for end-to-end (E2E) frontend tests
	- Jest for backend API and model tests
- **Modern developer workflow:**
	- Modular React and Express codebase
	- API error handling and in-page feedback
	- Environment-based configuration

---

## 🛠️ Tech Stack

- **Frontend:** React (client/), Playwright (E2E)
- **Backend:** Node.js, Express (server/), Jest (unit/integration)
- **Database:** MongoDB (Mongoose ODM)

---

## 🧪 Testing

- **Frontend:**
	- All major user flows are covered by Playwright tests in `client/tests/`.
	- Run with:
		```bash
		cd client
		npx playwright test
		```
- **Backend:**
	- Comprehensive Jest tests for routes, models, and middleware in `server/tests/`.
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

## 📁 Folder Structure

```
recipe-share/
├── client/         # React frontend (UI, pages, API calls, Playwright tests)
│   ├── src/
│   │   ├── pages/  # Page components (add-recipe, home, authentication, recipe-details)
│   │   ├── api/    # API helper
│   │   └── ...     # Other React files
│   └── tests/      # Playwright E2E tests
├── server/         # Node.js/Express backend (API, models, routes, middleware, Jest tests)
│   ├── models/     # Mongoose models (User, Recipe)
│   ├── routes/     # API routes (auth, recipes, user)
│   ├── tests/      # Jest tests
│   └── ...         # Other backend files
```

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## 📝 License
MIT License
