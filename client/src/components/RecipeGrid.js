// RecipeGrid.js - Paginated recipe grid component
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRegStar, FaClock, FaUtensils } from 'react-icons/fa';
import resolveImageUrl from '../utils/resolveImageUrl';
import './RecipeGrid.scss';

/**
 * Paginated grid component for displaying recipe cards with like, save, and view actions.
 *
 * @param {Object} props
 * @param {Array<Object>} props.recipes - Array of recipe objects to display.
 * @param {function} props.onViewRecipe - Function to call when a recipe is clicked.
 * @param {function} [props.onQuickView] - Optional function to show a quick preview without navigation.
 * @param {boolean} [props.loading] - Whether recipes are loading.
 * @param {number} [props.itemsPerPage] - Number of recipes to show per page (default 8).
 * @returns {JSX.Element}
 */
export default function RecipeGrid({
  recipes,
  onViewRecipe,
  onQuickView,
  loading = false,
  itemsPerPage = 8 // 4 per row, 2 rows
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRecipeId, setHoveredRecipeId] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [recipes]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(recipes.length / itemsPerPage));
  const paginatedRecipes = recipes.slice(0, currentPage * itemsPerPage);
  const showingAllRecipes = paginatedRecipes.length >= recipes.length;

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading && recipes.length === 0) {
    return <div className="recipe-grid-loading">Loading recipes...</div>;
  }

  if (recipes.length === 0) {
    return (
      <div className="recipe-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your filters or search for something else</p>
        </div>
      </div>
    );
  }

  // Get recipe image URL with legacy support
  const getRecipeImage = (r) => (
    (typeof r.imageUrl === 'string' && r.imageUrl.trim()) ||
    (Array.isArray(r.imageUrls) && r.imageUrls.find(u => typeof u === 'string' && u.trim())) ||
    (Array.isArray(r.images) && r.images.find(u => typeof u === 'string' && u.trim())) ||
    (typeof r.image === 'string' && r.image.trim()) ||
    "/hero-food.jpg"
  );

  return (
    <div className="recipe-grid-container">
      <div className="recipe-grid">
        <AnimatePresence>
          {paginatedRecipes.map((recipe, idx) => {
            // Calculate average rating
            const avgRating =
              recipe.ratings && recipe.ratings.length > 0
                ? recipe.ratings.reduce((a, b) => a + b.value, 0) / recipe.ratings.length
                : 0;

            const isHovered = hoveredRecipeId === recipe._id;

            const imageSrc = resolveImageUrl(getRecipeImage(recipe));
            return (
              <motion.div
                key={recipe._id}
                className="recipe-grid-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                  delay: idx % itemsPerPage * 0.05
                }}
                onMouseEnter={() => setHoveredRecipeId(recipe._id)}
                onMouseLeave={() => setHoveredRecipeId(null)}
                onClick={() => onViewRecipe && onViewRecipe(recipe)}
              >
                <div className="recipe-card">
                  <div className="recipe-image-container">
                    <img
                      src={imageSrc}
                      alt={recipe.title}
                      className="recipe-image"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src.endsWith('/hero-food.jpg')) return;
                        e.currentTarget.src = '/hero-food.jpg';
                      }}
                    />

                    {recipe.category && (
                      <div className="recipe-category">{recipe.category}</div>
                    )}

                    <div className={`recipe-overlay ${isHovered ? 'visible' : ''}`}>
                      <button
                        className="view-recipe-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onQuickView) {
                            onQuickView(recipe);
                          } else if (onViewRecipe) {
                            onViewRecipe(recipe);
                          }
                        }}
                      >
                        View Recipe
                      </button>
                    </div>
                  </div>

                  <div className="recipe-content">
                    <h3 className="recipe-title">{recipe.title}</h3>

                    <div className="recipe-meta">
                      {recipe.cookTime && (
                        <div className="recipe-time">
                          <FaClock /> {recipe.cookTime} min
                        </div>
                      )}

                      {recipe.difficulty && (
                        <div className="recipe-difficulty">
                          <FaUtensils /> {recipe.difficulty}
                        </div>
                      )}
                    </div>

                    <div className="recipe-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= Math.round(avgRating) ? (
                            <FaStar className="star filled" />
                          ) : (
                            <FaRegStar className="star empty" />
                          )}
                        </span>
                      ))}
                      <span className="rating-count">
                        {recipe.ratings ? `(${recipe.ratings.length})` : ""}
                      </span>
                    </div>

                    {recipe.description && (
                      <p className="recipe-description">
                        {recipe.description.length > 80
                          ? `${recipe.description.substring(0, 80)}...`
                          : recipe.description
                        }
                      </p>
                    )}

                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {currentPage < totalPages && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Recipes'}
          </button>
        </div>
      )}

      {showingAllRecipes && recipes.length > itemsPerPage && (
        <div className="end-message">
          You've reached the end of the recipes
        </div>
      )}
    </div>
  );
}
