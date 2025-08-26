/**
 * App component
 * Sets up the main routes and navigation for the Recipe Share frontend
 * - Home: lists all recipes
 * - AuthPage: combined login/register
 * - AddRecipe: add a new recipe
 * - RecipeDetail: view a single recipe
 */

import React, { useState, useEffect } from "react";
import DarkModeToggle from "./components/DarkModeToggle";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./App.scss";
import Home from "./pages/home/Home";
import AuthPage from "./pages/authentication/AuthPage";
import AddRecipe from "./pages/add-recipe/AddRecipe";
import RecipeDetail from "./pages/recipe-details/RecipeDetail";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <AuthPage />
            </motion.div>
          }
        />
        <Route
          path="/register"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <AuthPage />
            </motion.div>
          }
        />
        <Route
          path="/add"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <AddRecipe />
            </motion.div>
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <RecipeDetail />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("darkMode", dark);
  }, [dark]);
  // Timer reference
  let inactivityTimer = null;

  // Sign out function
  const handleSignOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    window.location.href = "/";
  };

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (loggedIn) {
      inactivityTimer = setTimeout(() => {
        alert("You have been signed out due to inactivity.");
        handleSignOut();
      }, 30 * 60 * 1000); // 30 minutes
    }
  };

  useEffect(() => {
    // Listen for login/logout changes in other tabs
    const handler = () => setLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", handler);

    // Listen for user activity
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );

    // Start timer if logged in
    if (loggedIn) resetInactivityTimer();

    return () => {
      window.removeEventListener("storage", handler);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
    // eslint-disable-next-line
  }, [loggedIn]);

  return (
    <BrowserRouter>
      <nav className="main-nav" aria-label="Main navigation">
        <Link
          className="main-nav__link"
          to="/"
          tabIndex={0}
          aria-label="Home page"
        >
          Home
        </Link>
        {loggedIn ? (
          <>
            <Link
              className="main-nav__link"
              to="/add"
              tabIndex={0}
              aria-label="Add a new recipe"
            >
              Add Recipe
            </Link>
            <button
              className="main-nav__button"
              onClick={handleSignOut}
              tabIndex={0}
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            className="main-nav__link"
            to="/login"
            tabIndex={0}
            aria-label="Login or Register"
          >
            Login/Register
          </Link>
        )}
        <DarkModeToggle dark={dark} setDark={setDark} />
      </nav>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

/**
 * Exports the App component for use in the app
 */
export default App;
