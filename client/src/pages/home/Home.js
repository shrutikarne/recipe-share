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
  const [showSearch, setShowSearch] = useState(false);
  const [diet, setDiet] = useState("");
  const navigate = useNavigate();

  // Fetch recipes from backend
  const fetchRecipes = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (ingredient) params.ingredient = ingredient;
    if (diet) params.diet = diet;
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

  // Handlers
  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const handleCardClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  const handleLike = async (e, recipeId) => {
    e.stopPropagation();
    setLikeLoading((prev) => ({ ...prev, [recipeId]: true }));
    try {
      const res = await API.post(`/recipes/${recipeId}/like`);
      setRecipes((prev) =>
        prev.map((r) =>
          r._id === recipeId
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
  return (
    <div className="home-container">
      <div className="home-header-bar">
        <h1>All Recipes</h1>
        <button
          className="search-icon-btn"
          aria-label="Open search"
          onClick={() => setShowSearch((s) => !s)}
        >
          {/* SVG search icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        {showSearch && (
          <div className="search-dropdown">
            <form className="recipe-filter-form" onSubmit={(e) => { handleFilter(e); setShowSearch(false); }}>
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="recipe-filter-input"
                autoFocus
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
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="recipe-filter-input"
              >
                <option value="">All Diet Types</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="omnivore">Omnivore</option>
                <option value="other">Other</option>
              </select>
              <button className="recipe-filter-btn" type="submit">
                Search
              </button>
            </form>
          </div>
        )}
      </div>
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
                    {r.likes && userId && r.likes.includes(userId) ? "♥" : "♡"} {r.likes ? r.likes.length : 0}
                  </button>
                  <button
                    className="recipe-card-btn save"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Recipe saved!");
                    }}
                    aria-label="Save Recipe"
                  >
                    <span role="img" aria-label="Save">💾</span>
                  </button>
                  <button
                    className="recipe-card-btn share"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Share link copied!");
                    }}
                    aria-label="Share Recipe"
                  >
                    <span role="img" aria-label="Share">🔗</span>
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

export default Home;
