import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "./Home.css";
import { useNavigate } from "react-router-dom";

/**
 * Home component
 * Fetches and displays a list of all recipes from the backend API.
 * @component
 */
function Home() {
  // --- State for the list of recipes ---
  const [recipes, setRecipes] = useState([]);
  const [likeLoading, setLikeLoading] = useState({});
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Data Fetching ---
  /**
   * Fetches recipes from the backend with optional filters.
   */
  const fetchRecipes = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (ingredient) params.ingredient = ingredient;
    API.get("/recipes", { params })
      .then((res) => setRecipes(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes();
    // Get userId from JWT (if logged in)
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.user.id);
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  // --- Handlers (in order of user flow) ---
  /**
   * Handles search/filter form submission.
   * @param {React.FormEvent} e
   */
  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  /**
   * Handles liking/unliking a recipe.
   * @param {React.MouseEvent} e
   * @param {string} recipeId
   */
  const handleLike = async (e, recipeId) => {
    e.stopPropagation();
    setLikeLoading((prev) => ({ ...prev, [recipeId]: true }));
    try {
      const res = await API.post(`/recipes/${recipeId}/like`);
      setRecipes((prev) =>
        prev.map((r) =>
          r._id === recipeId // Check if this is the recipe being liked/unliked
            ? {
                ...r,
                likes: res.data.liked
                  ? [...(r.likes || []), userId]
                  : (r.likes || []).filter((id) => id !== userId),
              }
            : r
        )
      );
    } catch (err) {
      alert("You must be logged in to like recipes.");
    }
    setLikeLoading((prev) => ({ ...prev, [recipeId]: false }));
  };

  /**
   * Handles clicking a recipe card to view details.
   * @param {string} id - The recipe ID
   */
  const handleCardClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  // --- Render logic (in order of user flow) ---
  return (
    <div className="home-container">
      <h1>All Recipes</h1>
      {/* Search and filter controls */}
      <form
        className="recipe-filter-form"
        onSubmit={handleFilter}
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="recipe-filter-input"
        />
        <input
          type="text"
          placeholder="Filter by ingredient..."
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          className="recipe-filter-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="recipe-filter-input"
        >
          <option value="">All Categories</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Dessert">Dessert</option>
          <option value="Snack">Snack</option>
          <option value="Beverage">Beverage</option>
        </select>
        <button className="recipe-filter-btn" type="submit">
          Search
        </button>
      </form>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>
      ) : (
        <div className="recipe-list">
          {recipes.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", width: "100%" }}>
              No recipes found.
            </div>
          )}
          {recipes.map((r) => (
            <div
              key={r._id}
              className="recipe-card"
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(r._id)}
            >
              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  alt={r.title}
                  className="recipe-card-img"
                />
              )}
              <div className="recipe-card-content">
                <h3 className="recipe-card-title">{r.title}</h3>
                <p className="recipe-card-desc">{r.description}</p>
                <div className="recipe-card-actions">
                  <button
                    className="recipe-card-btn like"
                    onClick={(e) => handleLike(e, r._id)}
                    disabled={likeLoading[r._id]}
                    aria-label="Like"
                  >
                    {r.likes && userId && r.likes.includes(userId) ? "♥" : "♡"}{" "}
                    {r.likes ? r.likes.length : 0}
                  </button>
                  <button
                    className="recipe-card-btn save"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Recipe saved!");
                    }}
                  >
                    Save Recipe
                  </button>
                  <button
                    className="recipe-card-btn share"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Share link copied!");
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Exports the Home component for use in the app
 */
export default Home;
// client/src/pages/Home.js
// This page displays all recipes from the backend in a styled list
