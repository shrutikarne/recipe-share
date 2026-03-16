import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTiles from "../../components/CategoryTiles";
import RecipeGrid from "../../components/RecipeGrid";
import API from "../../api/api";
import "./Home.scss";
import { FaUtensils } from "react-icons/fa";
import Footer from "../../components/Footer";

/**
 * Home component
 * Fetches and displays a list of all recipes from the backend API.
 * @component
 * @returns {JSX.Element}
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
    fetchRecipes();
    if (recipesRef.current) {
      recipesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Search submit handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
    if (recipesRef.current) {
      recipesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // --- State for the list of recipes ---
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [diet, setDiet] = useState("");
  const [prepTime, setPrepTime] = useState("");

  // Fetch recipes from backend
  const requestControllerRef = React.useRef(null);

  const fetchRecipes = React.useCallback(() => {
    setLoading(true);
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }
    const controller = new AbortController();
    requestControllerRef.current = controller;

    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (diet) params.diet = diet;
    if (prepTime) params.prepTime = prepTime;

    API.get("/recipes", { params, signal: controller.signal })
      .then((res) => {
        setRecipes(res.data.recipes || res.data);
      })
      .catch((err) => {
        if (err && (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.name === 'AbortError')) return;
      })
      .finally(() => setLoading(false));
  }, [search, category, diet, prepTime]);

  useEffect(() => {
    fetchRecipes();

    return () => {
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recipe card click handler
  const handleCardClick = (r) => {
    if (r && r._id) {
      navigate(`/recipe/${r._id}`);
    }
  };

 

 

  return (
    <>
      <section className="home-search">
        <form className="home-search__form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What do you want to cook today?"
            className="home-search__input"
            aria-label="Search recipes"
          />
          <button type="submit" className="home-search__button">
            Search
          </button>
        </form>
      </section>

      <section className="content-section">
        {/* Category Browse */}
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <CategoryTiles onCategorySelect={handleCategorySelect} />
        </div>

        <div ref={recipesRef} />
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
            loading={loading}
            onViewRecipe={handleCardClick}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
