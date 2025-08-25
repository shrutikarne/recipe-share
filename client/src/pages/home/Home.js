import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "./Home.scss";
import { motion } from "framer-motion";
import RecipeQuickPreviewModal from "../../components/RecipeQuickPreviewModal";
import Modal from "react-modal";
import RecipeDetail from "../recipe-details/RecipeDetail";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaRegStar,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import Masonry from "react-masonry-css";

/**
 * Home component
 * Fetches and displays a list of all recipes from the backend API.
 * @component
 */
function Home() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [saveLoading, setSaveLoading] = useState({});
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fullDetailRecipe, setFullDetailRecipe] = useState(null);
  const [fullDetailOpen, setFullDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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

  // Fetch recipes from backend
  const fetchRecipes = (reset = false) => {
    setLoading(true);
    const params = { skip: reset ? 0 : page * 20, limit: 20 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (ingredient) params.ingredient = ingredient;
    if (diet) params.diet = diet;
    API.get("/recipes", { params })
      .then((res) => {
        if (reset) {
          setRecipes(res.data);
          setPage(1);
        } else {
          setRecipes((prev) => [...prev, ...res.data]);
          setPage((prev) => prev + 1);
        }
        setHasMore(res.data.length === 20);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes(true);
    // Get userId from JWT (if logged in)
    const token = localStorage.getItem("token");
    if (token) {
      let payload;
      try {
        payload = JSON.parse(atob(token.split(".")[1]));
      } catch {
        payload = null;
      }
      if (payload && payload.user && payload.user.id) {
        setUserId(payload.user.id);
        API.get("/user/saved")
          .then((res) => {
            setSavedRecipes(res.data.map((r) => r.recipe._id));
          })
          .catch((err) => {
            if (err.response && err.response.status === 401) {
              setSavedRecipes([]); // Silently ignore
            }
            // Do not log or throw for 401
          });
      }
    }
    // eslint-disable-next-line
  }, []);
  const handleSave = async (e, recipeId) => {
    e.stopPropagation();
    setSaveLoading((prev) => ({ ...prev, [recipeId]: true }));
    try {
      if (savedRecipes.includes(recipeId)) {
        await API.post(`/user/unsave/${recipeId}`);
        setSavedRecipes((prev) => prev.filter((id) => id !== recipeId));
      } else {
        await API.post(`/user/save/${recipeId}`);
        setSavedRecipes((prev) => [...prev, recipeId]);
      }
    } catch (err) {
      alert("You must be logged in to save recipes.");
    }
    setSaveLoading((prev) => ({ ...prev, [recipeId]: false }));
  };

  // Handlers
  const handleFilter = (e) => {
    e.preventDefault();
    fetchRecipes(true);
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        fetchRecipes();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [loading, hasMore, search, category, ingredient, diet]);

  // Show quick preview text on hover, open modal on click
  const [hoveredRecipeId, setHoveredRecipeId] = useState(null);
  const handleCardMouseEnter = (recipe) => {
    setHoveredRecipeId(recipe._id);
  };
  const handleCardMouseLeave = () => {
    setHoveredRecipeId(null);
  };
  const handleCardClick = (recipe) => {
    setPreviewRecipe(recipe);
    setPreviewOpen(true);
  };
  // Open full details modal
  const handleViewFullRecipe = (recipe) => {
    setFullDetailRecipe(recipe);
    setFullDetailOpen(true);
    setPreviewOpen(false);
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
          tabIndex={0}
        >
          {/* SVG search icon */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {showSearch && (
          <div className="search-dropdown">
            <form
              className="recipe-filter-form"
              onSubmit={(e) => {
                handleFilter(e);
                setShowSearch(false);
              }}
              aria-label="Recipe search form"
            >
              <label htmlFor="search-title" className="visually-hidden">
                Search by title
              </label>
              <input
                id="search-title"
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="recipe-filter-form__input"
                autoFocus
              />
              <label htmlFor="search-ingredient" className="visually-hidden">
                Filter by ingredient
              </label>
              <input
                id="search-ingredient"
                type="text"
                placeholder="Filter by ingredient..."
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="recipe-filter-form__input"
              />
              <label htmlFor="search-category" className="visually-hidden">
                Category
              </label>
              <select
                id="search-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="recipe-filter-form__input"
              >
                <option value="">All Categories</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
                <option value="Beverage">Beverage</option>
              </select>
              <label htmlFor="search-diet" className="visually-hidden">
                Diet Type
              </label>
              <select
                id="search-diet"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="recipe-filter-form__input"
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
              <button
                className="recipe-filter-form__button"
                type="submit"
                aria-label="Search recipes"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>
      ) : (
        <Masonry
          breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
          className="recipe-masonry"
          columnClassName="recipe-masonry-col"
        >
          {recipes.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", width: "100%" }}>
              No recipes found.
            </div>
          )}
          {recipes.map((r, idx) => {
            // Calculate average rating
            const avgRating =
              r.ratings && r.ratings.length > 0
                ? r.ratings.reduce((a, b) => a + b.value, 0) / r.ratings.length
                : 0;
            return (
              <motion.div
                key={r._id}
                className="recipe-card"
                style={{ cursor: "pointer", position: "relative" }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 8px 32px rgba(37,99,235,0.12)",
                  zIndex: 2,
                }}
                transition={{
                  delay: idx * 0.04,
                  duration: 0.4,
                  type: "spring",
                }}
                onMouseEnter={() => handleCardMouseEnter(r)}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => handleCardClick(r)}
              >
                {r.imageUrls && r.imageUrls.length > 0 ? (
                  <img
                    src={r.imageUrls[0]}
                    alt={r.title}
                    className="recipe-card__img"
                  />
                ) : r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="recipe-card__img"
                  />
                ) : null}
                <div className="recipe-card__content">
                  {/* Quick preview text overlay on hover */}
                  {hoveredRecipeId === r._id && (
                    <motion.div
                      className="quick-preview-hover-text"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(255,255,255,0.92)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        borderRadius: "12px",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        color: "#2563eb",
                        pointerEvents: "none",
                        boxShadow:
                          "0 2px 12px rgba(132,204,22,0.10), 0 1.5px 4px rgba(251,113,133,0.10)",
                      }}
                    >
                      Quick Preview
                    </motion.div>
                  )}
                  <div className="recipe-card__tags">
                    {r.tags &&
                      r.tags.map((tag, i) => (
                        <span
                          className="recipe-card__tag"
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategory("");
                            setIngredient("");
                            setDiet("");
                            setSearch("");
                            fetchRecipes(true);
                            setTimeout(() => {
                              setSearch("");
                              setCategory("");
                              setIngredient("");
                              setDiet("");
                              // Set tag filter and reload
                              window.scrollTo({ top: 0, behavior: "smooth" });
                              setTimeout(() => {
                                API.get("/recipes", { params: { tag } }).then(
                                  (res) => {
                                    setRecipes(res.data);
                                    setPage(1);
                                    setHasMore(res.data.length === 20);
                                  }
                                );
                              }, 100);
                            }, 0);
                          }}
                          style={{ cursor: "pointer" }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Filter by tag: ${tag}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategory("");
                              setIngredient("");
                              setDiet("");
                              setSearch("");
                              fetchRecipes(true);
                              setTimeout(() => {
                                setSearch("");
                                setCategory("");
                                setIngredient("");
                                setDiet("");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                setTimeout(() => {
                                  API.get("/recipes", { params: { tag } }).then(
                                    (res) => {
                                      setRecipes(res.data);
                                      setPage(1);
                                      setHasMore(res.data.length === 20);
                                    }
                                  );
                                }, 100);
                              }, 0);
                            }
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                  <h3 className="recipe-card__title">{r.title}</h3>
                  {r.description && r.description.trim() && (
                    <p className="recipe-card__desc">{r.description}</p>
                  )}
                  <div className="recipe-card__rating">
                    {[1, 2, 3, 4, 5].map((n) =>
                      n <= Math.round(avgRating) ? (
                        <FaStar key={n} color="#facc15" />
                      ) : (
                        <FaRegStar key={n} color="#d1d5db" />
                      )
                    )}
                    <span className="recipe-card__rating-count">
                      {r.ratings ? `(${r.ratings.length})` : ""}
                    </span>
                  </div>
                  <div className="recipe-card__actions">
                    <button
                      className="recipe-card__btn like"
                      onClick={(e) => handleLike(e, r._id)}
                      disabled={likeLoading[r._id]}
                      aria-label={
                        r.likes && userId && r.likes.includes(userId)
                          ? "Unlike recipe"
                          : "Like recipe"
                      }
                      tabIndex={0}
                    >
                      {r.likes && userId && r.likes.includes(userId) ? (
                        <FaHeart color="#ef4444" />
                      ) : (
                        <FaRegHeart color="#9ca3af" />
                      )}{" "}
                      {r.likes ? r.likes.length : 0}
                    </button>
                    <button
                      className="recipe-card__btn save"
                      onClick={(e) => handleSave(e, r._id)}
                      disabled={saveLoading[r._id]}
                      aria-label={
                        savedRecipes.includes(r._id)
                          ? "Unsave recipe"
                          : "Save recipe"
                      }
                      tabIndex={0}
                    >
                      {savedRecipes.includes(r._id) ? (
                        <FaBookmark color="#2563eb" />
                      ) : (
                        <FaRegBookmark color="#9ca3af" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <RecipeQuickPreviewModal
            isOpen={previewOpen && !!previewRecipe}
            onRequestClose={() => {
              setPreviewOpen(false);
              setPreviewRecipe(null);
            }}
            recipe={previewRecipe}
            onViewFullRecipe={handleViewFullRecipe}
          />
          {fullDetailOpen && fullDetailRecipe && fullDetailRecipe._id && (
            <Modal
              isOpen={true}
              onRequestClose={() => {
                setFullDetailOpen(false);
                setFullDetailRecipe(null);
              }}
              className="recipe-preview-modal recipe-details-modal"
              overlayClassName="recipe-preview-overlay"
              contentLabel="Recipe Full Details"
              ariaHideApp={false}
              shouldCloseOnOverlayClick={true}
            >
              <div
                style={{
                  maxHeight: "80vh",
                  overflowY: "auto",
                  padding: "32px",
                  position: "relative",
                }}
              >
                <button
                  className="close-btn"
                  style={{ position: "absolute", top: 12, right: 18 }}
                  onClick={() => {
                    setFullDetailOpen(false);
                    setFullDetailRecipe(null);
                  }}
                >
                  &times;
                </button>
                <RecipeDetail id={fullDetailRecipe._id} modalMode={true} />
              </div>
            </Modal>
          )}
        </Masonry>
      )}
    </div>
  );
}

export default Home;
