import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./Home.css";

/**
 * Home component
 * Fetches and displays a list of all recipes from the backend API.
 */

function Home() {
  /**
   * State for the list of recipes
   */
  const [recipes, setRecipes] = useState([]);

  /**
   * Fetch all recipes from the backend when the component mounts
   */
  useEffect(() => {
    API.get("/recipes")
      .then((res) => setRecipes(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="home-container">
      <h1>All Recipes</h1>
      {recipes.map((r) => (
        <div key={r._id} className="recipe-card">
          <h3>{r.title}</h3>
          <p>{r.description}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Exports the Home component for use in the app
 */
export default Home;
// client/src/pages/Home.js
// This page displays all recipes from the backend in a styled list
