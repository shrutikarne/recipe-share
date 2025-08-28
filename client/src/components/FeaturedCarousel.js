// FeaturedCarousel.js - Netflix-style horizontal scroll carousel for trending recipes
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaPlay, FaClock } from "react-icons/fa";
import "./FeaturedCarousel.scss";

export default function FeaturedCarousel({
  recipes,
  title = "🔥 Trending Now",
  onViewRecipe,
  horizontalScroll = false
}) {
  const cardWidth = 300;
  const [hovered, setHovered] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef(null);
  const autoScrollEnabled = true; // Always enabled for horizontal scroll
  const autoScrollIntervalRef = useRef(null);
  // No clones needed for dynamic infinite scroll

  // Set initial scroll position to 0
  useEffect(() => {
    if (horizontalScroll && scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrollPosition(0);
    }
  }, [horizontalScroll, recipes.length]);

  // Infinite smooth auto-scroll effect (no clones)
  useEffect(() => {
    if (horizontalScroll && autoScrollEnabled && !hovered && recipes.length > 1) {
      const container = scrollRef.current;
      if (!container) return;
      let frameId;
      const SPEED = 0.5; // pixels per frame, adjust for speed
      function step() {
        if (!container) return;
        container.scrollLeft += SPEED;
        // If at the end, reset to start (seamless)
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
        frameId = requestAnimationFrame(step);
      }
      frameId = requestAnimationFrame(step);
      return () => {
        if (frameId) cancelAnimationFrame(frameId);
      };
    }
  }, [horizontalScroll, autoScrollEnabled, hovered, recipes.length]);

  // No need for handleInfiniteScroll without clones

  // Handle scroll navigation
  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    let newPosition = container.scrollLeft + scrollAmount;
    // If scrolling right and at end, reset to start
    if (direction === 'right' && newPosition >= container.scrollWidth - container.clientWidth) {
      newPosition = 0;
    }
    // If scrolling left and at start, go to end
    if (direction === 'left' && newPosition < 0) {
      newPosition = container.scrollWidth - container.clientWidth;
    }
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  // Handle view recipe click
  const handleViewRecipe = (recipe, e) => {
    e.stopPropagation();
    if (onViewRecipe) {
      onViewRecipe(recipe);
    }
  };

  return (
    <section
      className={`featured-carousel-section ${hovered ? 'hovered' : ''} ${horizontalScroll ? 'horizontal-scroll' : ''}`}
      onMouseEnter={() => {
        setHovered(true);
        // Pause auto-scrolling when user hovers
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
          autoScrollIntervalRef.current = null;
        }
      }}
      onMouseLeave={() => {
        setHovered(false);
        // Auto-scrolling will resume due to useEffect dependency on hovered state
      }}
    >
      {!horizontalScroll && (
        <div className="carousel-header">
          <h2 className="featured-carousel-title">{title}</h2>
          <div className="carousel-controls">
            <span>View all</span>
          </div>
        </div>
      )}

      <div className="carousel-container">
        {!horizontalScroll && (
          <button
            className={`nav-button prev ${hovered ? 'visible' : ''} ${scrollPosition <= 0 ? 'disabled' : ''}`}
            onClick={() => handleScroll('left')}
            aria-label="Previous recipes"
          >
            <FaChevronLeft />
          </button>
        )}

        <div
          className={`featured-carousel ${horizontalScroll ? 'horizontal-scroll' : ''}`}
          ref={scrollRef}
        >
          {recipes.map((r, idx) => (
            <motion.div
              className="featured-carousel-card"
              key={r._id ? `${r._id}-${idx}` : `card-${idx}`}
              style={{ width: cardWidth, minWidth: cardWidth }}
              whileHover={{
                scale: 1.1,
                zIndex: 10,
                transition: { duration: 0.3 }
              }}
              onClick={() => onViewRecipe && onViewRecipe(r)}
            >
              <div className="card-image-container">
                <img
                  src={r.imageUrl || (r.imageUrls && r.imageUrls[0]) || "/logo512.png"}
                  alt={r.title}
                  className="featured-carousel-img"
                />
                <div className="card-overlay">
                  <div className="card-badges">
                    {r.cookTime && (
                      <span className="time-badge">
                        <FaClock /> {r.cookTime} min
                      </span>
                    )}
                  </div>
                  <button
                    className="play-button"
                    onClick={(e) => handleViewRecipe(r, e)}
                  >
                    <FaPlay /> View
                  </button>
                </div>
              </div>
              <div className="featured-carousel-info">
                <h3 className="featured-carousel-title-row">{r.title}</h3>
                <div className="featured-carousel-meta">
                  {r.ratings && r.ratings.length > 0 ? (
                    <div className="rating">⭐ {(r.ratings.reduce((s, r) => s + r.value, 0) / r.ratings.length).toFixed(1)}</div>
                  ) : null}
                  {r.category && <div className="category">{r.category}</div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!horizontalScroll && (
          <button
            className={`nav-button next ${hovered ? 'visible' : ''}`}
            onClick={() => handleScroll('right')}
            aria-label="Next recipes"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}
