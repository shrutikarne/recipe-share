// FeaturedCarousel.js - horizontal scroll carousel for featured/trending recipes
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FeaturedCarousel({ recipes, title = "🔥 Trending Now" }) {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (!recipes || recipes.length === 0) return;
    if (paused) return;
    const el = scrollRef.current;
    if (!el) return;
    let frame;
    let last = Date.now();
    function step() {
      if (!paused && el) {
        const now = Date.now();
        const dt = Math.min(32, now - last);
        el.scrollLeft += 0.18 * dt; // speed px/ms
        if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - 2) {
          el.scrollLeft = 0;
        }
        last = now;
        frame = requestAnimationFrame(step);
      }
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [paused, recipes]);

  return (
    <section className="featured-carousel-section">
      <h2 className="featured-carousel-title">{title}</h2>
      <div
        className="featured-carousel"
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {recipes.map((r) => (
          <motion.div
            className="featured-carousel-card"
            key={r._id}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #facc15cc" }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <img src={r.imageUrl || (r.imageUrls && r.imageUrls[0])} alt={r.title} className="featured-carousel-img" />
            <div className="featured-carousel-info">
              <div className="featured-carousel-title-row">{r.title}</div>
              <div className="featured-carousel-desc">{r.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
