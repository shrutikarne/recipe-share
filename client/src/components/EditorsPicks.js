// EditorsPicks.js - auto-sliding carousel with curated recipes
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";

export default function EditorsPicks({ recipes, title = "👩‍🍳 Editor's Picks", onViewRecipe }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const carouselRef = useRef(null);

  // Make sure we have at least 3 recipes
  const displayRecipes = recipes && recipes.length > 0
    ? recipes.length >= 3
      ? recipes
      : [...recipes, ...recipes, ...recipes].slice(0, 6)
    : [];

  // Calculate visible recipes
  const visibleCount = 3; // Number of visible recipes at once
  const totalRecipes = displayRecipes.length;

  // Auto slide timer
  useEffect(() => {
    // Don't set up the timer if there are no recipes or if paused
    if (totalRecipes === 0 || paused) {
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalRecipes);
    }, 4000);

    return () => clearInterval(timerRef.current);
  }, [paused, totalRecipes]);

  // Handle navigation
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalRecipes) % totalRecipes);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalRecipes);
  };

  // Create carousel of 3 items with the current index at the center
  const getVisibleRecipes = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % totalRecipes;
      result.push({
        recipe: displayRecipes[index],
        position: i
      });
    }
    return result;
  };

  // Conditionally render based on whether there are recipes
  return displayRecipes.length === 0 ? null : (
    <section
      className="editors-picks-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="editors-header">
        <div className="editors-title-container">
          <h2 className="editors-picks-title">{title}</h2>
          <p className="editors-subtitle">Handpicked by our culinary experts</p>
        </div>

        <div className="editors-controls">
          <button
            className="editors-nav-btn prev"
            onClick={handlePrev}
            aria-label="Previous recipe"
          >
            <FaChevronLeft />
          </button>
          <div className="editors-indicators">
            {displayRecipes.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button
            className="editors-nav-btn next"
            onClick={handleNext}
            aria-label="Next recipe"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="editors-carousel-container" ref={carouselRef}>
        <div className="editors-carousel">
          <AnimatePresence mode="popLayout">
            {getVisibleRecipes().map(({ recipe: r, position }) => (
              <motion.div
                className={`editors-picks-card position-${position}`}
                key={`${r._id}-${position}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 24
                }}
                onClick={() => onViewRecipe && onViewRecipe(r)}
              >
                <div className="editors-card-badge">Editor's Choice</div>

                <div className="editors-img-container">
                  <img
                    src={r.imageUrl || (r.imageUrls && r.imageUrls[0]) || "/logo512.png"}
                    alt={r.title}
                    className="editors-picks-img"
                  />
                </div>

                <div className="editors-picks-info">
                  <div className="editors-rating">
                    <FaStar className="star-icon" />
                    <span>Editor's Rating: 4.8</span>
                  </div>
                  <h3 className="editors-picks-title-row">{r.title}</h3>
                  <div className="editors-picks-desc">
                    {r.description && r.description.length > 120
                      ? `${r.description.substring(0, 120)}...`
                      : r.description}
                  </div>
                  <div className="editors-meta">
                    {r.author && <span className="editors-author">By {r.author}</span>}
                    {r.cookTime && <span className="editors-time">{r.cookTime} min</span>}
                  </div>
                </div>

                <div className="editors-card-footer">
                  <button className="view-recipe-btn">View Recipe</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
