
/**
 * App component
 * Sets up the main routes and navigation for the Recipe Share frontend
 * - Home: lists all recipes
 * - AuthPage: combined login/register
 * - AddRecipe: add a new recipe
 * - RecipeDetail: view a single recipe
 */

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home/Home";
import AuthPage from "./pages/authentication/AuthPage";
import AddRecipe from "./pages/add-recipe/AddRecipe";
import RecipeDetail from "./pages/recipe-details/RecipeDetail";


function App() {

  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
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
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));

    // Start timer if logged in
    if (loggedIn) resetInactivityTimer();

    return () => {
      window.removeEventListener("storage", handler);
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
    // eslint-disable-next-line
  }, [loggedIn]);

  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> |
        {loggedIn ? (
          <>
            <Link to="/add">Add Recipe</Link> |
            <button onClick={handleSignOut} style={{ background: "none", border: "none", color: "#1976d2", cursor: "pointer", padding: 0, font: "inherit" }}>Sign Out</button>
          </>
        ) : (
          <Link to="/login">Login/Register</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/add" element={<AddRecipe />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Exports the App component for use in the app
 */
export default App;
// client/src/App.js
// Main entry point for the React app, handles routing and navigation