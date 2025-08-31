// RecipeGrid.js - Paginated recipe grid component
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaBookmark, FaRegBookmark, FaClock, FaUtensils } from 'react-icons/fa';
import './RecipeGrid.scss';

export default function RecipeGrid({
  recipes,
  onViewRecipe,
  onLike,
  onSave,
  userId,
  savedRecipes = [],
  likeLoading = {},
  saveLoading = {},
  loading = false,
  hasMore = false,
  onLoadMore,
  itemsPerPage = 8 // 4 per row, 2 rows
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRecipeId, setHoveredRecipeId] = useState(null);

  // Calculate pagination
  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  const paginatedRecipes = recipes.slice(0, currentPage * itemsPerPage);
  const showingAllRecipes = currentPage * itemsPerPage >= recipes.length;

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (hasMore && onLoadMore) {
      onLoadMore();
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
                      alt={recipe.title}
                      className="recipe-image"
                    />

                    {recipe.category && (
                      <div className="recipe-category">{recipe.category}</div>
                    )}

                    <div className={`recipe-overlay ${isHovered ? 'visible' : ''}`}>
                      <button className="view-recipe-btn">View Recipe</button>
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

                    <div className="recipe-actions">
                      <button
                        className="action-btn like-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike && onLike(e, recipe._id);
                        }}
                        disabled={likeLoading[recipe._id]}
                      >
                        {recipe.likes && userId && recipe.likes.includes(userId) ? (
                          <FaHeart className="liked" />
                        ) : (
                          <FaRegHeart />
                        )}
                        <span>{recipe.likes ? recipe.likes.length : 0}</span>
                      </button>

                      <button
                        className="action-btn save-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSave && onSave(e, recipe._id);
                        }}
                        disabled={saveLoading[recipe._id]}
                      >
                        {savedRecipes.includes(recipe._id) ? (
                          <FaBookmark className="saved" />
                        ) : (
                          <FaRegBookmark />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {(currentPage < totalPages || hasMore) && (
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

      {!hasMore && showingAllRecipes && recipes.length > itemsPerPage && (
        <div className="end-message">
          You've reached the end of the recipes
        </div>
      )}
    </div>
  );
}
