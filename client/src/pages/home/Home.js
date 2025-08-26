import React, { useEffect, useState } from "react";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import "../../components/RecipeOfTheDay.scss";
import RecipeOfTheDay from "../../components/RecipeOfTheDay";
import CategoryTiles from "../../components/CategoryTiles";
import EditorsPicks from "../../components/EditorsPicks";
import "../../components/EditorsPicks.scss";
import "../../components/CategoryTiles.scss";
import "../../components/FeaturedCarousel.scss";
import HeroBanner from "../../components/HeroBanner";
import "../../components/HeroBanner.scss";
import { fetchRecipeAutocomplete } from "../../api/autocomplete";
import API from "../../api/api";
import "./Home.scss";
import { motion } from "framer-motion";
import RecipeQuickPreviewModal from "../../components/RecipeQuickPreviewModal";
import DarkModeToggle from "../../components/DarkModeToggle";
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
  const [recipes, setRecipes] = useState([]);
  const [dark, setDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  React.useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  // (All state variables declared only once, above this comment)
  const recipesRef = React.useRef(null);

  // Editor's Picks: random 6 recipes (could be personalized in future)
  const editorsPicks = React.useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [recipes]);
  // Category tile click handler
  const handleCategorySelect = (cat) => {
    if (!cat) return;
    if (cat.key === "quick") setPrepTime("30");
    else if (cat.key === "vegetarian") setDiet("vegetarian");
    else if (cat.key === "desserts") setCategory("Dessert");
    else if (cat.key === "dinner2") setCategory(""); // Could add a custom filter
    else if (cat.key === "snacks") setCategory("Snack");
    else if (cat.key === "breakfast") setCategory("Breakfast");
    else if (cat.key === "beverage") setCategory("Beverage");
    else if (cat.key === "soup") setCategory("");
    fetchRecipes(true);
    if (recipesRef.current) {
      recipesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Featured/trending recipes (simple filter: top 8 by likes or rating)
  const trendingRecipes = React.useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    // Sort by likes, fallback to ratings
    return [...recipes]
      .sort((a, b) => {
        const aLikes = (a.likes ? a.likes.length : 0);
        const bLikes = (b.likes ? b.likes.length : 0);
        if (bLikes !== aLikes) return bLikes - aLikes;
        const aRating = a.ratings && a.ratings.length > 0 ? a.ratings.reduce((s, r) => s + r.value, 0) / a.ratings.length : 0;
        const bRating = b.ratings && b.ratings.length > 0 ? b.ratings.reduce((s, r) => s + r.value, 0) / b.ratings.length : 0;
        return bRating - aRating;
      })
      .slice(0, 8);
  }, [recipes]);
  // Hero search submit handler
  const handleHeroSearch = (e) => {
    e.preventDefault();
    setShowSearch(false);
    fetchRecipes(true);
    if (recipesRef.current) {
      recipesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Browse button scrolls to recipes
  const handleBrowse = () => {
    if (recipesRef.current) {
      recipesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Upload button navigates to add page
  const handleUpload = () => {
    window.location.href = "/add";
  };
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [saveLoading, setSaveLoading] = useState({});
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fullDetailRecipe, setFullDetailRecipe] = useState(null);
  const [fullDetailOpen, setFullDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // --- State for the list of recipes ---

  const [likeLoading, setLikeLoading] = useState({});
  const [userId, setUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [diet, setDiet] = useState("");
  // New filter state
  const [cuisine, setCuisine] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [vegetarian, setVegetarian] = useState("");
  const [difficulty, setDifficulty] = useState("");
  // Autocomplete
  const [autocomplete, setAutocomplete] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  // Fetch autocomplete suggestions
  useEffect(() => {
    let active = true;
    if (search.length < 2) {
      setAutocomplete([]);
      return;
    }
    fetchRecipeAutocomplete(search).then((results) => {
      if (active) setAutocomplete(results);
    });
    return () => { active = false; };
  }, [search]);

  // Fetch recipes from backend
  const fetchRecipes = (reset = false) => {
    setLoading(true);
    const params = { skip: reset ? 0 : page * 20, limit: 20 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (ingredient) params.ingredient = ingredient;
    if (diet) params.diet = diet;
    if (cuisine) params.cuisine = cuisine;
    if (prepTime) params.prepTime = prepTime;
    if (vegetarian) params.vegetarian = vegetarian;
    if (difficulty) params.difficulty = difficulty;
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
    setShowAutocomplete(false);
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
      {/* Recipe of the Day Spotlight */}
      {recipes && recipes.length > 0 && (
        <>
          <RecipeOfTheDay recipes={recipes} useBackendRandom />
          <div style={{ textAlign: 'center', margin: '0 0 1.5rem 0' }}>
            <button
              onClick={() => document.querySelector('.shuffle-btn')?.click()}
              style={{
                background: 'linear-gradient(90deg,#facc15 0%,#f7b731 100%)',
                color: '#222',
                border: 'none',
                borderRadius: '1.5rem',
                fontWeight: 600,
                fontSize: '1.1rem',
                padding: '0.7rem 2.2rem',
                boxShadow: '0 2px 16px #facc15cc',
                cursor: 'pointer',
                marginTop: '0.5rem',
                transition: 'background 0.2s',
              }}
            >
              🎲 What should I cook today?
            </button>
          </div>
        </>
      )}
      <HeroBanner
        onSearch={handleHeroSearch}
        search={search}
        setSearch={setSearch}
        onBrowse={handleBrowse}
        onUpload={handleUpload}
      />
  <FeaturedCarousel recipes={trendingRecipes} title="🔥 Trending Now" />
  <CategoryTiles onSelect={handleCategorySelect} />
  <EditorsPicks recipes={editorsPicks} title="👩‍🍳 Editor's Picks" />
      <div ref={recipesRef} />
      <div className="home-header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 18 }}>Recipes</span>
        <DarkModeToggle dark={dark} setDark={setDark} />
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
          <motion.div className="search-dropdown" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
            <form
              className="recipe-filter-form"
              onSubmit={(e) => {
                handleFilter(e);
                setShowSearch(false);
              }}
              aria-label="Recipe search form"
              autoComplete="off"
            >
              {/* ...existing code for search/filter form... */}
              <label htmlFor="search-title" className="visually-hidden">
                Search by title
              </label>
              <input
                id="search-title"
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowAutocomplete(true);
                }}
                className="recipe-filter-form__input"
                autoFocus
                autoComplete="off"
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
              />
              {showAutocomplete && autocomplete.length > 0 && (
                <motion.ul className="autocomplete-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                  {autocomplete.map((item) => (
                    <li
                      key={item._id}
                      className="autocomplete-item"
                      onMouseDown={() => {
                        setSearch(item.title);
                        setShowAutocomplete(false);
                      }}
                    >
                      {item.title}
                    </li>
                  ))}
                </motion.ul>
              )}
              {/* ...rest of filter form unchanged... */}
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
              <label htmlFor="search-cuisine" className="visually-hidden">
                Cuisine
              </label>
              <input
                id="search-cuisine"
                type="text"
                placeholder="Cuisine (e.g. Italian, Indian)"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="recipe-filter-form__input"
              />
              <label htmlFor="search-preptime" className="visually-hidden">
                Prep Time
              </label>
              <input
                id="search-preptime"
                type="number"
                min="0"
                placeholder="Max Prep Time (min)"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="recipe-filter-form__input"
              />
              <label htmlFor="search-vegetarian" className="visually-hidden">
                Vegetarian
              </label>
              <select
                id="search-vegetarian"
                value={vegetarian}
                onChange={(e) => setVegetarian(e.target.value)}
                className="recipe-filter-form__input"
              >
                <option value="">All</option>
                <option value="true">Vegetarian</option>
                <option value="false">Non-Vegetarian</option>
              </select>
              <label htmlFor="search-difficulty" className="visually-hidden">
                Difficulty
              </label>
              <select
                id="search-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="recipe-filter-form__input"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
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
          </motion.div>
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
            const isFlipped = hoveredRecipeId === r._id;
            return (
              <motion.div
                key={r._id}
                className={"recipe-card flip-card" + (isFlipped ? " flipped" : "")}
                style={{ cursor: "pointer", position: "relative", background: "linear-gradient(135deg, #f3f4f6 0%, #e0e7ef 100%)" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 12px 40px 0 rgba(37,99,235,0.13)",
                  zIndex: 2,
                }}
                transition={{
                  delay: idx * 0.06,
                  duration: 0.5,
                  type: "spring",
                }}
                onMouseEnter={() => handleCardMouseEnter(r)}
                onMouseLeave={handleCardMouseLeave}
                onClick={() => handleCardClick(r)}
              >
                <div className="flip-card-inner">
                  {/* Front Face */}
                  <div className="flip-card-front">
                    {r.imageUrls && r.imageUrls.length > 0 ? (
                      <img
                        src={r.imageUrls[0]}
                        alt={r.title}
                        className="recipe-card__img"
                        style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                      />
                    ) : r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.title}
                        className="recipe-card__img"
                        style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                      />
                    ) : null}
                    <motion.div
                      className="recipe-card__content"
                      initial={false}
                      animate={isFlipped ? { y: -24 } : { y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      <motion.h3
                        className="recipe-card__title"
                        initial={false}
                        animate={isFlipped ? { y: -18 } : { y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      >
                        {r.title}
                      </motion.h3>
                      {r.description && r.description.trim() && (
                        <p className="recipe-card__desc">{r.description}</p>
                      )}
                    </motion.div>
                  </div>
                  {/* Back Face */}
                  <div className="flip-card-back">
                    <div className="recipe-card__content">
                      <div className="recipe-card__quickinfo">
                        <div><strong>Cook Time:</strong> {r.cookTime ? r.cookTime + ' min' : 'N/A'}</div>
                      </div>
                      <div className="recipe-card__rating">
                        {[1, 2, 3, 4, 5].map((n) =>
                          n <= Math.round(avgRating) ? (
                            <motion.span
                              key={n}
                              initial={{ scale: 0.7, rotate: -10, filter: 'brightness(0.7)' }}
                              animate={{ scale: 1.2, rotate: 0, filter: 'brightness(1.2)' }}
                              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 * n }}
                              style={{ display: 'inline-block' }}
                            >
                              <FaStar color="#facc15" />
                            </motion.span>
                          ) : (
                            <motion.span
                              key={n}
                              initial={{ scale: 0.7, opacity: 0.6 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 * n }}
                              style={{ display: 'inline-block' }}
                            >
                              <FaRegStar color="#d1d5db" />
                            </motion.span>
                          )
                        )}
                        <span className="recipe-card__rating-count">
                          {r.ratings ? `(${r.ratings.length})` : ""}
                        </span>
                      </div>
                      <motion.div
                        className="recipe-card__actions"
                        initial={false}
                        animate={isFlipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                        transition={{ duration: 0.25, delay: isFlipped ? 0.12 : 0 }}
                        style={{ pointerEvents: isFlipped ? 'auto' : 'none' }}
                      >
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
                          <motion.span
                            key={r._id + '-like'}
                            animate={r.likes && userId && r.likes.includes(userId) ? { scale: [1, 1.3, 1], color: '#ef4444' } : { scale: 1, color: '#9ca3af' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                            style={{ display: 'inline-block', verticalAlign: 'middle' }}
                          >
                            {r.likes && userId && r.likes.includes(userId) ? (
                              <FaHeart color="#ef4444" />
                            ) : (
                              <FaRegHeart color="#9ca3af" />
                            )}
                          </motion.span>
                          {" "}{r.likes ? r.likes.length : 0}
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
                          <motion.span
                            key={r._id + '-save'}
                            animate={savedRecipes.includes(r._id) ? { scale: [1, 1.2, 1], color: '#2563eb' } : { scale: 1, color: '#9ca3af' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                            style={{ display: 'inline-block', verticalAlign: 'middle' }}
                          >
                            {savedRecipes.includes(r._id) ? (
                              <FaBookmark color="#2563eb" />
                            ) : (
                              <FaRegBookmark color="#9ca3af" />
                            )}
                          </motion.span>
                        </button>
                      </motion.div>
                    </div>
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
            {/* Load More button for recipes */}
            {hasMore && !loading && (
              <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                <button
                  onClick={() => fetchRecipes()}
                  style={{
                    background: 'linear-gradient(90deg,#facc15 0%,#f7b731 100%)',
                    color: '#222',
                    border: 'none',
                    borderRadius: '1.5rem',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    padding: '0.7rem 2.2rem',
                    boxShadow: '0 2px 16px #facc15cc',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'background 0.2s',
                  }}
                >
                  Load More Recipes
                </button>
              </div>
            )}
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