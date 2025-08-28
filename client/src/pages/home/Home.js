import React, { useEffect, useState } from "react";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import CategoryTiles from "../../components/CategoryTiles";
import EditorsPicks from "../../components/EditorsPicks";
import CookSuggestion from "../../components/CookSuggestion";
import RecipeGrid from "../../components/RecipeGrid";
import "../../components/EditorsPicks.scss";
import "../../components/CategoryTiles.scss";
import "../../components/FeaturedCarousel.scss";
import "../../components/RecipeGrid.scss";
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
import { FaFilter } from "react-icons/fa";
import Footer from "../../components/Footer";

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
    window.location.href = "/add-recipe";
  };
  // State for saved recipes handling
  const [saveLoading, setSaveLoading] = useState({});
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fullDetailRecipe, setFullDetailRecipe] = useState(null);
  const [fullDetailOpen, setFullDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecipes, setTotalRecipes] = useState(0);
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
  // eslint-disable-next-line no-unused-vars
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
    const params = { skip: reset ? 0 : page * 9, limit: 9 };
    if (search) params.search = search;
    if (category) params.category = category;
    if (ingredient) params.ingredient = ingredient;
    if (diet) params.diet = diet;
    if (cuisine) params.cuisine = cuisine;
    if (prepTime) params.prepTime = prepTime;
    if (vegetarian) params.vegetarian = vegetarian;
    if (difficulty) params.difficulty = difficulty;

    // First get the total count for pagination
    API.get("/recipes/count", {
      params: {
        search, category, ingredient, diet, cuisine, prepTime, vegetarian, difficulty
      }
    })
      .then((countRes) => {
        setTotalRecipes(countRes.data.count);

        // Then fetch the recipes for the current page
        return API.get("/recipes", { params });
      })
      .then((res) => {
        if (reset) {
          setRecipes(res.data);
          setPage(0);
        } else {
          setRecipes(res.data);
        }
        setHasMore(res.data.length === 9);
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
        // Fetch user's saved recipes
        API.get("/user/saved")
          .then((res) => {
            // Store saved recipe IDs in recipe objects directly when they're fetched
          })
          .catch(console.error);
      }
    }

    // Attach scroll listener for infinite scrolling
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 300 &&
        hasMore &&
        !loading
      ) {
        fetchRecipes();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recipe card click handler
  const handleCardClick = (r) => {
    setPreviewRecipe(r);
    setPreviewOpen(true);
  };

  const handleViewFullRecipe = (recipe) => {
    setPreviewOpen(false);
    setFullDetailOpen(true);
    setFullDetailRecipe(recipe);
  };

  const handleLike = (recipeId) => {
    if (!userId) {
      window.location.href = "/auth";
      return;
    }
    setLikeLoading((prev) => ({ ...prev, [recipeId]: true }));
    API.post(`/recipes/${recipeId}/like`)
      .then((res) => {
        setRecipes((prev) =>
          prev.map((r) =>
            r._id === recipeId
              ? { ...r, isLiked: res.data.isLiked, likes: res.data.likes }
              : r
          )
        );
      })
      .catch(console.error)
      .finally(() => {
        setLikeLoading((prev) => ({ ...prev, [recipeId]: false }));
      });
  };

  const handleSave = (recipeId) => {
    if (!userId) {
      window.location.href = "/auth";
      return;
    }
    setSaveLoading((prev) => ({ ...prev, [recipeId]: true }));
    API.post(`/recipes/${recipeId}/save`)
      .then((res) => {
        // Update the isSaved flag directly on the recipe
        setRecipes((prev) =>
          prev.map((r) =>
            r._id === recipeId ? { ...r, isSaved: res.data.isSaved } : r
          )
        );
      })
      .catch(console.error)
      .finally(() => {
        setSaveLoading((prev) => ({ ...prev, [recipeId]: false }));
      });
  };

  const handleRate = (recipeId, rating) => {
    if (!userId) {
      window.location.href = "/auth";
      return;
    }
    API.post(`/recipes/${recipeId}/rate`, { rating })
      .then((res) => {
        setRecipes((prev) =>
          prev.map((r) =>
            r._id === recipeId
              ? {
                ...r,
                ratings: res.data.ratings,
                avgRating: res.data.avgRating,
                userRating: rating,
              }
              : r
          )
        );
      })
      .catch(console.error);
  };

  // This functional component + the framer-motion tag creates a nice animation for recipe filters
  const FilterForm = () => (
    <motion.div
      className="recipe-filter-form__container"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form
        className="recipe-filter-form"
        onSubmit={(e) => {
          e.preventDefault();
          setShowSearch(false);
          fetchRecipes(true);
        }}
      >
        <div className="recipe-filter-form__header">
          <h2>Filter Recipes</h2>
          <button
            type="button"
            className="recipe-filter-form__close"
            onClick={() => setShowSearch(false)}
            aria-label="Close filters"
          >
            &times;
          </button>
        </div>
        <div className="recipe-filter-form__fields">
          <div className="recipe-filter-form__field">
            <label htmlFor="search-term">Search Term</label>
            <div className="recipe-filter-form__search-container">
              <input
                id="search-term"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowAutocomplete(true);
                }}
                className="recipe-filter-form__input"
                placeholder="Search recipes..."
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                onFocus={() => setShowAutocomplete(true)}
              />
              {showAutocomplete && autocomplete.length > 0 && (
                <ul className="search-autocomplete">
                  {autocomplete.map((item) => (
                    <li
                      key={item._id || item}
                      className="search-autocomplete__item"
                      onClick={() => {
                        setSearch(item.title || item);
                        setShowAutocomplete(false);
                      }}
                    >
                      {item.title || item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="recipe-filter-form__field">
            <label htmlFor="search-ingredient">Ingredient</label>
            <input
              id="search-ingredient"
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="recipe-filter-form__input"
              placeholder="e.g. chicken, tomato"
            />
          </div>

          <div className="recipe-filter-form__field">
            <label htmlFor="search-category">Category</label>
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
              <option value="Appetizer">Appetizer</option>
              <option value="Snack">Snack</option>
              <option value="Dessert">Dessert</option>
              <option value="Beverage">Beverage</option>
              <option value="Side">Side Dish</option>
              <option value="Main">Main Course</option>
            </select>
          </div>

          <div className="recipe-filter-form__field">
            <label htmlFor="search-cuisine">Cuisine</label>
            <select
              id="search-cuisine"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="recipe-filter-form__input"
            >
              <option value="">All Cuisines</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Indian">Indian</option>
              <option value="French">French</option>
              <option value="Thai">Thai</option>
              <option value="Greek">Greek</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="American">American</option>
            </select>
          </div>

          <div className="recipe-filter-form__field">
            <label htmlFor="search-prepTime">Preparation Time</label>
            <select
              id="search-prepTime"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              className="recipe-filter-form__input"
            >
              <option value="">Any Time</option>
              <option value="15">15 minutes or less</option>
              <option value="30">30 minutes or less</option>
              <option value="60">1 hour or less</option>
            </select>
          </div>

          <div className="recipe-filter-form__field">
            <label htmlFor="search-difficulty">Difficulty</label>
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
          </div>

          <div className="recipe-filter-form__field">
            <label htmlFor="search-diet">Diet Type</label>
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
          </div>

          <button
            className="recipe-filter-form__button"
            type="submit"
            aria-label="Search recipes"
          >
            Search
          </button>
        </div>
      </form>
    </motion.div>
  );

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <HeroBanner
          onSearch={handleHeroSearch}
          search={search}
          setSearch={setSearch}
          onBrowse={handleBrowse}
          onUpload={handleUpload}
        />
      </section>

      <section className="content-section">
        {/* Featured Recipes */}
        <div className="section-divider">
          <span className="section-title">Featured Recipes</span>
        </div>
        <FeaturedCarousel recipes={trendingRecipes} />

        {/* What Should I Cook Today and Editor's Picks - 2 Column Layout */}
        <div className="two-column-section">
          <div className="left-column">
            {/* Explore by Mood - Vibrant Grid */}
            <div className="section-divider">
              <span className="section-title">What Should I Cook Today?</span>
            </div>
            <div className="mood-exploration-section">
              <CookSuggestion />
            </div>
          </div>
          <div className="right-column">
            {/* Editor's Picks - Editorial Carousel */}
            <div className="section-divider">
              <span className="section-title">Editor's Picks</span>
            </div>
            <EditorsPicks recipes={editorsPicks} />
          </div>
        </div>

        {/* Category Browse */}
        <div className="section-divider">
          <span className="section-title">Browse by Category</span>
        </div>
        <CategoryTiles onCategorySelect={handleCategorySelect} />

        <div ref={recipesRef} />
        <div className="home-header-bar">
          <span className="header-title">All Recipes</span>
          <div className="header-actions">
            <DarkModeToggle dark={dark} setDark={setDark} />
            <button
              className="search-icon-btn"
              aria-label="Open search"
              onClick={() => setShowSearch((s) => !s)}
              tabIndex={0}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {showSearch && <FilterForm />}

        <div className="all-recipes-section">
          <div className="section-divider smaller">
            <span className="section-title">Browse All Recipes</span>
            <button
              className="filter-button"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle filters"
            >
              <FaFilter /> Filters
            </button>
          </div>

          <RecipeGrid
            recipes={recipes}
            isLoading={loading}
            onLike={handleLike}
            onSave={handleSave}
            onRate={handleRate}
            onRecipeClick={handleCardClick}
            onQuickView={(recipe) => {
              setPreviewRecipe(recipe);
              setPreviewOpen(true);
            }}
            likeLoading={likeLoading}
            saveLoading={saveLoading}
            totalRecipes={totalRecipes}
            currentPage={page}
            onPageChange={(newPage) => {
              setPage(newPage);
              fetchRecipes(true);
              window.scrollTo({
                top: recipesRef.current.offsetTop - 100,
                behavior: "smooth"
              });
            }}
          />
        </div>
      </section>

      {/* Recipe Quick Preview Modal */}
      <RecipeQuickPreviewModal
        isOpen={previewOpen && !!previewRecipe}
        onRequestClose={() => {
          setPreviewOpen(false);
          setPreviewRecipe(null);
        }}
        recipe={previewRecipe}
        onViewFullRecipe={handleViewFullRecipe}
      />

      {/* Full Recipe Detail Modal */}
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
          <div className="recipe-modal-content">
            <button
              className="close-btn"
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

      <Footer />
    </>
  );
}

export default Home;
