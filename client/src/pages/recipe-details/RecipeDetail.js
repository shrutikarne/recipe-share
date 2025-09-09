import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./RecipeDetails.scss";
import { fetchRecipe } from "../../api/recipes";
import { ShareIcon, SaveIcon, PrintIcon } from "../../components/SvgIcons";

/**
 * RecipeDetail page component
 * Fetches and displays a single recipe with all details, comments, and related recipes.
 * Handles loading, error, and mock data fallback.
 *
 * @returns {JSX.Element}
 */
function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [newComment, setNewComment] = useState("");
  const [baseServings, setBaseServings] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [servings, setServings] = useState(1);
  const stepsRef = useRef(null);

  // Fetch recipe data when component mounts
  useEffect(() => {
    const getRecipeData = async () => {
      try {
        setLoading(true);

        // Try to fetch from API
        try {
          const recipeData = await fetchRecipe(id);
          if (recipeData) {
            setRecipe(recipeData);
          } else {
            // If API returns null/undefined, use mock data for testing
            setRecipe(getMockRecipe(id));
          }
        } catch (apiError) {
          // Use mock data if API fails
          setRecipe(getMockRecipe(id));
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load the recipe. Please try again.");
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

  // Check if recipe is already saved
  useEffect(() => {
    if (recipe) {
      // Get saved recipes from localStorage
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      // Check if current recipe is in saved recipes
      setIsSaved(savedRecipes.some(savedRecipe => savedRecipe.id === recipe.id));
    }
  }, [recipe]);

  // Mock recipe data for testing - remove in production
  /**
   * Returns mock recipe data for testing (used if API fails).
   * @param {string} recipeId
   * @returns {Object}
   */
  const getMockRecipe = (recipeId) => {
    return {
      id: recipeId,
      title: "Creamy Garlic Parmesan Pasta",
      tagline: "Creamy, Comforting & Perfect for Weeknights",
      description: "This creamy garlic parmesan pasta is the ultimate comfort food that's ready in just 20 minutes. Made with simple ingredients you probably already have in your pantry, it's perfect for busy weeknights when you need something delicious and satisfying with minimal effort.",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80",
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      cuisine: "Italian",
      category: "Pasta",
      difficulty: "Easy",
      author: {
        name: "Jamie Oliver",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      ingredients: [
        "8 oz pasta of your choice",
        "2 tablespoons olive oil",
        "4 cloves garlic, minced",
        "1 cup heavy cream",
        "1 cup freshly grated Parmesan cheese",
        "Salt and black pepper to taste",
        "Red pepper flakes (optional)",
        "Fresh parsley for garnish"
      ],
      steps: [
        "Bring a large pot of salted water to a boil. Add pasta and cook according to package directions until al dente.",
        "While pasta cooks, heat olive oil in a large skillet over medium heat. Add minced garlic and sauté until fragrant, about 1-2 minutes.",
        "Pour in the heavy cream and bring to a simmer. Cook for 3-4 minutes until it starts to thicken slightly.",
        "Reduce heat to low and gradually stir in the Parmesan cheese until smooth and creamy.",
        "Season with salt, pepper, and red pepper flakes if using.",
        "Drain pasta, reserving 1/2 cup of pasta water. Add pasta directly to the sauce.",
        "Toss to coat, adding a splash of reserved pasta water if needed to thin the sauce.",
        "Garnish with fresh parsley and additional Parmesan cheese before serving."
      ],
      tips: [
        "For extra protein, add grilled chicken or sautéed shrimp.",
        "Use freshly grated Parmesan cheese rather than pre-grated for the best texture.",
        "If the sauce thickens too much, add a splash of pasta water to thin it out.",
        "Add a handful of baby spinach at the end for color and nutrition."
      ],
      comments: [
        {
          user: "Sophie W.",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          text: "Made this last night and it was amazing! So creamy and flavorful. I added some grilled chicken and it was perfect!",
          date: "2 days ago",
          isAuthor: false
        },
        {
          user: "Jamie Oliver",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          text: "So glad you enjoyed it, Sophie! Grilled chicken is a great addition.",
          date: "Yesterday",
          isAuthor: true
        },
        {
          user: "Mark R.",
          avatar: "https://randomuser.me/api/portraits/men/76.jpg",
          text: "Super easy and delicious. My kids loved it too!",
          date: "4 hours ago",
          isAuthor: false
        }
      ],
      relatedRecipes: [
        {
          id: "123",
          title: "Spaghetti Carbonara",
          image: "https://images.unsplash.com/photo-1600803907087-f56d462fd26b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
          difficulty: "Medium",
          totalTime: 25
        },
        {
          id: "124",
          title: "Fettuccine Alfredo",
          image: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
          difficulty: "Easy",
          totalTime: 20
        }
      ]
    };
  };

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

  // Calculate total time - with proper null checks
  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0);

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

  // Prefer backend fields (imageUrl/imageUrls); fall back to mock field
  const heroImageSrc =
    recipe?.imageUrl || (Array.isArray(recipe?.imageUrls) && recipe.imageUrls[0]) || recipe?.image || "/hero-food.jpg";

  return (
    <div>

      {/* --- Main Content Layout --- */}
      <div className="recipe-content">
        <div className="content-left">
          {/* Recipe Image */}
          <div>
            <img src={heroImageSrc} alt={recipe?.title} className="recipe-img" />
          </div>

          {/* Recipe Information Card - moved below the image */}
          <div className="recipe-info-wrapper">
            <div className="recipe-meta">
              {recipe?.category && <span className="recipe-category">{recipe.category}</span>}
              {recipe?.cuisine && <span className="recipe-cuisine">{recipe.cuisine}</span>}
            </div>
            <div className="title-and-actions">
              <div>
                <h1>{recipe?.title}</h1>
              </div>
              <div>
                <SaveIcon
                  className={`icon-button ${isSaved ? 'saved' : ''}`}
                  role="button"
                  tabIndex="0"
                  aria-label={isSaved ? "Remove from saved recipes" : "Save recipe"}
                  onClick={() => handleSaveRecipe(recipe, isSaved, setIsSaved)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveRecipe(recipe, isSaved, setIsSaved)}
                  fill={isSaved ? "currentColor" : "none"}
                />
                <ShareIcon
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                  aria-label="Share recipe"
                  onClick={() => handleShare(recipe)}
                  onKeyPress={(e) => e.key === 'Enter' && handleShare(recipe)}
                />
                <PrintIcon
                  className="icon-button"
                  role="button"
                  tabIndex="0"
                  aria-label="Print recipe"
                  onClick={() => window.print()}
                  onKeyPress={(e) => e.key === 'Enter' && window.print()}
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
            </div>

            {/* Recipe Info Card */}
            <div className="info-grid">
              <div className="info-item">
                <h4>⏱ Prep Time</h4>
                <p>{formatTime(recipe?.prepTime || 0)}</p>
              </div>
              <div className="info-item">
                <h4>🍳 Cook Time</h4>
                <p>{formatTime(recipe?.cookTime || 0)}</p>
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
                        <img src={recipe.stepImages[index]} alt={`Step ${index + 1}`} className="step-image" />
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
                    <img src={relatedRecipe?.image} alt={relatedRecipe?.title} />
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

            <section className="recipe-comments">
              <h2>Comments</h2>
              <div className="comment-box">
                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button>Post</button>
              </div>
              <div className="comment-list">
                {recipe?.comments?.length > 0 ? (
                  recipe.comments.map((comment, index) => (
                    <div key={index} className={`comment ${comment.isAuthor ? 'author-comment' : ''}`}>
                      <div className="comment-user">
                        <img src={comment?.avatar || "/default-avatar.png"} alt={comment?.user} />
                        <strong>{comment?.user}</strong>
                        {comment?.isAuthor && <span className="author-badge">Author</span>}
                      </div>
                      <p>{comment?.text}</p>
                      <div className="comment-meta">
                        <span>{comment?.date || "Just now"}</span>
                        <button className="reply-btn">Reply</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;

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

function handleSaveRecipe(recipe, isSaved, setIsSaved) {
  // Get current saved recipes from localStorage
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
  
  if (isSaved) {
    // Remove this recipe from saved recipes
    const updatedRecipes = savedRecipes.filter(savedRecipe => savedRecipe.id !== recipe.id);
    localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    setIsSaved(false);
    
    // Show feedback to user
    alert('Recipe removed from your saved collection');
  } else {
    // Add this recipe to saved recipes (saving only essential details)
    const recipeToSave = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.imageUrl || recipe.image,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      difficulty: recipe.difficulty || 'Easy',
      category: recipe.category,
      cuisine: recipe.cuisine,
      savedAt: new Date().toISOString()
    };
    
    savedRecipes.push(recipeToSave);
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    setIsSaved(true);
    
    // Show feedback to user
    alert('Recipe saved to your collection');
  }
}
