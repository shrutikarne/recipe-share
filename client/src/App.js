
/**
 * App component
 * Sets up the main routes and navigation for the Recipe Share frontend
 * - Home: lists all recipes
 * - AuthPage: combined login/register
 * - AddRecipe: add a new recipe
 * - RecipeDetail: view a single recipe
 */
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import AddRecipe from "./pages/AddRecipe";
import RecipeDetail from "./pages/RecipeDetail";


function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login/Register</Link> | <Link to="/add">Add Recipe</Link>
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