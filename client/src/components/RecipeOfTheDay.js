import React, { useState } from "react";
import API from "../api/api";
import { FaRandom, FaInfoCircle } from "react-icons/fa";
import "./RecipeOfTheDay.scss";
import { motion, AnimatePresence } from "framer-motion";


// If useBackendRandom is true, fetch random recipe from backend
const RecipeOfTheDay = ({ recipes, useBackendRandom }) => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * recipes.length));
  const [showNutrition, setShowNutrition] = useState(false);
  const [randomRecipe, setRandomRecipe] = useState(null);
  const recipe = useBackendRandom ? randomRecipe : recipes[index];

  const shuffleRecipe = async () => {
    setShowNutrition(false);
    if (useBackendRandom) {
      try {
        const res = await API.get("/recipes/random");
        setRandomRecipe(res.data);
      } catch (err) {
        setRandomRecipe(null);
      }
    } else {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * recipes.length);
      } while (newIndex === index && recipes.length > 1);
      setIndex(newIndex);
    }
  };

  // On mount, fetch a random recipe if using backend
  React.useEffect(() => {
    if (useBackendRandom) shuffleRecipe();
    // eslint-disable-next-line
  }, [useBackendRandom]);

  if (!recipe) return null;

  return (
    <motion.div className="recipe-of-the-day-card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
      <div className="spotlight-header">
        <h2>Today’s Highlighted Recipe</h2>
        <button className="shuffle-btn" onClick={shuffleRecipe} title="Shuffle Recipe">
          <FaRandom />
        </button>
      </div>
      <div className="recipe-main">
        <img src={recipe.image || "/logo512.png"} alt={recipe.title} className="recipe-img" />
        <div className="recipe-info">
          <h3>{recipe.title}</h3>
          <p>{recipe.description}</p>
          <div className="meta">
            <span>⏱ {recipe.cookTime || "-"} min</span>
            <span>🍽 {recipe.servings || "-"} servings</span>
            <span>⭐ {recipe.ratings?.length ? (recipe.ratings.reduce((s, r) => s + r.value, 0) / recipe.ratings.length).toFixed(1) : "-"}</span>
            <button className="nutrition-btn" onClick={() => setShowNutrition((v) => !v)} title="Show Nutrition">
              <FaInfoCircle /> Nutrition
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showNutrition && (
          <motion.div className="nutrition-popover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
            <h4>Nutritional Info</h4>
            {recipe.nutrition ? (
              <ul>
                {Object.entries(recipe.nutrition).map(([k, v]) => (
                  <li key={k}><strong>{k}:</strong> {v}</li>
                ))}
              </ul>
            ) : (
              <p>No nutrition data available.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecipeOfTheDay;
