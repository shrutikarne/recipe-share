import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import CategoryTiles from "../../components/CategoryTiles";
import RecipeGrid from "../../components/RecipeGrid";
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
import Modal from "react-modal";
import RecipeDetail from "../recipe-details/RecipeDetail";
import { FaUtensils } from "react-icons/fa";
import Footer from "../../components/Footer";

/**
 * Home component
 * Fetches and displays a list of all recipes from the backend API.
 * @component
 */
function Home() {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();
  const recipesRef = React.useRef(null);

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
  // State for Browse Recipes modal
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  // Browse button opens modal with all filtered recipes
  const handleBrowse = () => {
    setShowBrowseModal(true);
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
  const [autocomplete, setAutocomplete] = useState([]);
  const searchInputRef = React.useRef(null);
  const [diet, setDiet] = useState("");
  // New filter state
  const [cuisine, setCuisine] = useState("");
  const [prepTime, setPrepTime] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [vegetarian, setVegetarian] = useState("");
  const [difficulty, setDifficulty] = useState("");
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
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes(true);
    // Use the token manager to check authentication status
    import("../../utils/tokenManager").then(({ isAuthenticated, getUserId }) => {
      if (isAuthenticated()) {
        const userId = getUserId();
        if (userId) {
          setUserId(userId);
          // Fetch user's saved recipes
          API.get("/user/saved")
            .then((res) => {
              // Store saved recipe IDs in recipe objects directly when they're fetched
            })
        }
      }
    });

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
    if (r && r._id) {
      navigate(`/recipe/${r._id}`);
    }
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
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          setShowSearch(false);
          fetchRecipes(true);
          setTimeout(() => {
            const el = document.getElementById("browse-all-recipes-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }}
      >
        <div className="recipe-filter-form__fields">
          <div className="recipe-filter-form__field" style={{ position: 'relative', flexBasis: '100%' }}>
            <label htmlFor="search-term">Search</label>
            <input
              id="search-term"
              type="text"
              value={search}
              ref={searchInputRef}
              onChange={e => {
                setSearch(e.target.value);
              }}
              className="recipe-filter-form__input"
              placeholder="Search recipes..."
              autoComplete="off"
              onFocus={() => { if (search.length > 1) setAutocomplete(autocomplete); }}
            />
            {autocomplete.length > 0 && search.length > 1 && (
              <ul className="search-autocomplete">
                {autocomplete.map((item, idx) => (
                  <li
                    key={item._id || item.title || idx}
                    className="search-autocomplete__item"
                    onMouseDown={() => {
                      setSearch(item.title || item);
                      setAutocomplete([]);
                      setTimeout(() => searchInputRef.current && searchInputRef.current.blur(), 100);
                    }}
                  >
                    {item.title || item}
                  </li>
                ))}
              </ul>
            )}
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

      {/* Browse Recipes Modal - Only Search/Filter Options */}
      <Modal
        isOpen={showBrowseModal}
        onRequestClose={() => setShowBrowseModal(false)}
        className="recipe-preview-modal browse-modal"
        overlayClassName="recipe-preview-overlay"
        contentLabel="Browse Recipes Filters"
        ariaHideApp={false}
        shouldCloseOnOverlayClick={true}
      >
        <div className="recipe-modal-content">
          <button
            className="close-btn"
            onClick={() => setShowBrowseModal(false)}
            aria-label="Close browse modal"
          >
            &times;
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Search & Filter Recipes</h2>
          <FilterForm />
        </div>
      </Modal>

      <section className="content-section">
        {/* Category Browse */}
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <CategoryTiles onCategorySelect={handleCategorySelect} />
        </div>

        {/* Trending Now carousel only (Editor's Picks removed) */}
        <div style={{ width: '100%', maxWidth: '1200px', margin: '32px auto' }}>
          <FeaturedCarousel
            recipes={trendingRecipes}
            horizontalScroll={true}
            title="🔥 Trending Now"
            visibleCount={4}
            cardWidth={300}
            onViewRecipe={(recipe) => {
              if (recipe && recipe._id) {
                window.location.href = `/recipe/${recipe._id}`;
              }
            }}
          />
        </div>

        <div ref={recipesRef} />

        {showSearch && <FilterForm />}

        <div className="all-recipes-section" id="browse-all-recipes-section">
          <div className="browse-all-recipes-section">
            <h2 className="browse-all-recipes-title">
              <FaUtensils className="browse-all-recipes-icon" />
              Browse All Recipes
            </h2>
            <p className="browse-all-recipes-subtitle">Find your next favorite dish from all recipes</p>
          </div>
          <RecipeGrid
            recipes={recipes}
            isLoading={loading}
            onLike={handleLike}
            onSave={handleSave}
            onRate={handleRate}
            onViewRecipe={handleCardClick}
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
