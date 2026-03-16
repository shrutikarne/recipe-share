import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "./RecipeDetails.scss";
import { fetchRecipe } from "../../api/recipes";
import { ShareIcon, PrintIcon } from "../../components/SvgIcons";
import resolveImageUrl from "../../utils/resolveImageUrl";

/**
 * RecipeDetail page component
 * Fetches and displays a single recipe with all details.
 * Handles loading and error states.
 *
 * @returns {JSX.Element}
 */
function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [baseServings, setBaseServings] = useState(1);
  const [servings, setServings] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const stepsRef = useRef(null);

  const galleryImages = useMemo(() => {
    if (!recipe || !Array.isArray(recipe.imageUrls)) return [];
    return recipe.imageUrls
      .map((url) => resolveImageUrl(url))
      .filter((url) => typeof url === 'string' && url.trim().length > 0);
  }, [recipe]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [recipe?.id, galleryImages.length]);

  // Fetch recipe data when component mounts
  useEffect(() => {
    const getRecipeData = async () => {
      setLoading(true);
      try {
        const recipeData = await fetchRecipe(id);
        if (recipeData) {
          setRecipe(recipeData);
          setError(null);
        } else {
          setRecipe(null);
          setError('Recipe not found.');
        }
      } catch (fetchError) {
        setRecipe(null);
        setError('Failed to load the recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getRecipeData();
  }, [id]);

  // Initialize servings when recipe loads
  useEffect(() => {
    if (recipe?.servings) {
      setBaseServings(recipe.servings);
      setServings(recipe.servings);
    } else {
      setBaseServings(1);
      setServings(1);
    }
  }, [recipe]);



  // Handle ingredient checkbox toggle
  /**
   * Toggles the checked state of an ingredient.
   * @param {number} index
   */
  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Format for cook time display
  /**
   * Formats time in minutes to a human-readable string.
   * @param {number} minutes
   * @returns {string}
   */
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins > 0 ? `${mins} min${mins > 1 ? 's' : ''}` : ''}`;
  };

  // Normalize time values in minutes for consistent calculations
  const rawPrepTime = Number(recipe?.prepTime);
  const rawCookTime = Number(recipe?.cookTime);
  const prepTimeMinutes = Number.isFinite(rawPrepTime) ? rawPrepTime : 0;
  const cookTimeMinutes = Number.isFinite(rawCookTime) ? rawCookTime : 0;
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  // Get difficulty level based on time and steps
  const getDifficulty = () => {
    const stepsCount = recipe?.steps?.length || 0;
    if (totalTime > 120 || stepsCount > 10) return "Hard";
    if (totalTime > 60 || stepsCount > 5) return "Medium";
    return "Easy";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading">Loading recipe...</p>
        <div className="loading-skeleton" aria-hidden>
          <div className="sk-hero" />
          <div className="sk-line w80" />
          <div className="sk-line w60" />
          <div className="sk-line w40" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message" role="alert">{error}</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="error-container">
        <p className="error-message">Recipe not found. It may have been deleted or is unavailable.</p>
      </div>
    );
  }

  const fallbackHero = resolveImageUrl(recipe?.imageUrl || recipe?.image);
  const heroImageSrc = galleryImages[activeImageIndex] || fallbackHero || '/hero-food.jpg';

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => {
      if (!galleryImages.length) return prev;
      return prev === 0 ? galleryImages.length - 1 : prev - 1;
    });
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => {
      if (!galleryImages.length) return prev;
      return (prev + 1) % galleryImages.length;
    });
  };

  return (
    <div>

      {/* --- Main Content Layout --- */}
      <div className="recipe-content">
        <div className="content-left">
          {/* Recipe Image */}
          <div className="recipe-image-hero">
            <img src={heroImageSrc} alt={recipe?.title} className="recipe-img" />
            {galleryImages.length > 1 && (
              <div className="recipe-image-hero__controls">
                <button type="button" aria-label="Previous recipe image" onClick={handlePrevImage}>
                  ‹
                </button>
                <button type="button" aria-label="Next recipe image" onClick={handleNextImage}>
                  ›
                </button>
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="recipe-image-thumbs" role="list">
              {galleryImages.map((imgSrc, idx) => (
                <button
                  type="button"
                  key={`${imgSrc}-${idx}`}
                  role="listitem"
                  aria-label={`Show recipe image ${idx + 1}`}
                  className={`recipe-image-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={imgSrc} alt={`Recipe view ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Recipe Information Card - moved below the image */}
          <div className="recipe-info-wrapper">
            <div className="title-and-actions">
              <div>
                <h1>{recipe?.title}</h1>
              </div>
              <div>
                <ShareIcon
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                  aria-label="Share recipe"
                  onClick={() => handleShare(recipe)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleShare(recipe);
                    }
                  }}
                />
                <PrintIcon
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                  aria-label="Print recipe"
                  onClick={() => window.print()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      window.print();
                    }
                  }}
                />
              </div>
            </div>
            <p className="recipe-tagline">
              {recipe?.tagline || "Delicious, Homemade & Perfect for Any Occasion"}
            </p>
            <div className="hero-meta">
              <span>⏱ {formatTime(totalTime)}</span>
              <span>👥 {recipe?.servings || 0} servings</span>
              <span>⭐ {getDifficulty()}</span>
              {recipe?.category && <span>🏷 {recipe.category}</span>}
              {recipe?.cuisine && <span>🍽 {recipe.cuisine}</span>}
            </div>

            {/* Recipe Info Card */}
            <div className="info-grid">
              <div className="info-item">
                <h4>⏱ Prep Time</h4>
                <p>{formatTime(prepTimeMinutes)}</p>
              </div>
              <div className="info-item">
                <h4>🍳 Cook Time</h4>
                <p>{formatTime(cookTimeMinutes)}</p>
              </div>
              {recipe?.calories && (
                <div className="info-item">
                  <h4>🍽 Calories</h4>
                  <p>{recipe.calories} kcal</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-right">
          <div className="content-main">
            <section className="recipe-description">
              <h2>About This Recipe</h2>
              <p>{recipe?.description}</p>
              {recipe?.author && (
                <div className="recipe-author">
                  <img src={recipe.author?.avatar || "/default-avatar.png"} alt={recipe.author?.name} />
                  <p>By <strong>{recipe.author?.name}</strong></p>
                </div>
              )}
            </section>

            <section className="recipe-ingredients" id="ingredients">
              <h2>Ingredients</h2>
              <div className="ingredients-card">
                <div className="servings-adjuster">
                  <span>Servings:</span>
                  <button
                    aria-label="Decrease servings"
                    title="Decrease servings"
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                  >
                    -
                  </button>
                  <span aria-live="polite">{servings}</span>
                  <button
                    aria-label="Increase servings"
                    title="Increase servings"
                    onClick={() => setServings((s) => Math.min(20, s + 1))}
                  >
                    +
                  </button>
                </div>
                <ul className="ingredients-list">
                  {recipe?.ingredients?.map((ingredient, index) => (
                    <li key={index} className={checkedIngredients[index] ? 'checked' : ''}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!checkedIngredients[index]}
                          onChange={() => toggleIngredient(index)}
                        />
                        <span>{scaleIngredient(ingredient, servings, baseServings)}</span>
                      </label>
                    </li>
                  )) || <li>No ingredients available</li>}
                </ul>
              </div>
            </section>

            <section className="recipe-steps" ref={stepsRef} id="steps">
              <h2>Instructions</h2>
              <div className="steps-container">
                {recipe?.steps?.map((step, index) => (
                  <div key={index} className="step-card">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      {recipe?.stepImages && recipe.stepImages[index] && (
                        <img src={resolveImageUrl(recipe.stepImages[index])} alt={`Step ${index + 1}`} className="step-image" />
                      )}
                      <p>{step}</p>
                    </div>
                  </div>
                )) || <p>No instructions available</p>}
              </div>
            </section>
          </div>

          <div className="content-sidebar">
            {recipe?.tips && recipe.tips.length > 0 && (
              <div className="sidebar-card tips-card">
                <h3>Chef's Tips</h3>
                <ul>
                  {recipe.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sidebar-card related-recipes">
              <h3>You Might Also Like</h3>
              {recipe?.relatedRecipes?.length > 0 ? (
                recipe.relatedRecipes.map((relatedRecipe, index) => (
                  <div key={index} className="related-recipe-item">
                    <img src={resolveImageUrl(relatedRecipe?.image)} alt={relatedRecipe?.title} />
                    <div>
                      <h4>{relatedRecipe?.title}</h4>
                      <p>{formatTime(relatedRecipe?.totalTime || 0)} • {relatedRecipe?.difficulty || 'Easy'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No related recipes available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---
function handleShare(recipe) {
  const shareData = {
    title: recipe?.title || 'Recipe',
    text: recipe?.tagline || 'Check out this recipe',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => { });
  } else if (navigator.clipboard && shareData.url) {
    navigator.clipboard.writeText(shareData.url).then(() => {
      alert('Link copied to clipboard');
    }).catch(() => {
      // noop
    });
  }
}

function scaleIngredient(line, servings, baseServings) {
  if (!line || !baseServings || !servings) return line;
  const mult = servings / baseServings;
  if (Math.abs(mult - 1) < 1e-6) return line;

  const parsed = parseLeadingQuantity(line);
  if (!parsed) return line;
  const scaled = parsed.value * mult;
  const formatted = formatQuantity(scaled);
  const rest = line.slice(parsed.matchedLength).trimStart();
  return `${formatted} ${rest}`.trim();
}

// Parse a leading quantity like "2", "1 1/2", "0.5", "1/3"
function parseLeadingQuantity(str) {
  const s = String(str);
  const re = /^\s*(?:(\d+(?:\.\d+)?)\s*)?(?:(\d+)\/(\d+))?/; // integer/decimal + optional fraction
  const m = s.match(re);
  if (!m) return null;
  const [matched, whole, num, den] = m;
  if (!whole && !num) return null; // no numeric at start
  let value = 0;
  if (whole) value += parseFloat(whole);
  if (num && den) value += parseInt(num, 10) / parseInt(den, 10);
  return { value, matchedLength: matched.length };
}

function formatQuantity(value) {
  const eps = 1e-2;
  const whole = Math.floor(value + eps);
  const frac = value - whole;
  if (Math.abs(frac) < 0.02) return String(whole);
  // Try common denominators
  const dens = [2, 3, 4, 6, 8];
  let best = { err: Infinity, n: 0, d: 1 };
  for (const d of dens) {
    const n = Math.round(frac * d);
    const err = Math.abs(frac - n / d);
    if (err < best.err) best = { err, n, d };
  }
  let parts = [];
  if (whole > 0) parts.push(String(whole));
  if (best.n > 0) parts.push(`${best.n}/${best.d}`);
  if (parts.length === 0) return value.toFixed(1);
  return parts.join(' ');
}

export default RecipeDetail;
