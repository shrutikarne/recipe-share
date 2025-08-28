// FeaturedCarousel.js - Netflix-style horizontal scroll carousel for trending recipes
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaPlay, FaClock } from "react-icons/fa";

export default function FeaturedCarousel({
  recipes,
  title = "🔥 Trending Now",
  onViewRecipe,
  horizontalScroll = false
}) {
  const [hovered, setHovered] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef(null);

  // Handle scroll navigation
  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 280; // width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    const newPosition = container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          {recipes.map((r) => (
            <motion.div
              className="featured-carousel-card"
              key={r._id}
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
