// CategoryTiles.js - stylish category/mood cards for explore section
import React from "react";
import "./CategoryTiles.scss";
import { motion } from "framer-motion";

const categories = [
  {
    key: "quick",
    label: "Quick & Easy",
    icon: "⚡",
    description: "Ready in 30 minutes or less",
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
  },
  {
    key: "comfort",
    label: "Comfort Food",
    icon: "🍲",
    description: "Cozy, satisfying dishes",
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
  },
  {
    key: "healthy",
    label: "Healthy",
    icon: "🥗",
    description: "Nutritious and balanced meals",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
  },
  {
    key: "sweet",
    label: "Sweet Tooth",
    icon: "🍰",
    description: "Desserts and sweet treats",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
  },
  {
    key: "datenight",
    label: "Date Night",
    icon: "❤️",
    description: "Impress your special someone",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  },
  {
    key: "breakfast",
    label: "Breakfast",
    icon: "🍳",
    description: "Start your day right",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  {
    key: "party",
    label: "Party Mood",
    icon: "🎉",
    description: "Crowd-pleasing favorites",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
  },
  {
    key: "kids",
    label: "Kid-Friendly",
    icon: "🧸",
    description: "Fun foods kids will love",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
  },
];

/**
 * CategoryTiles component for displaying recipe categories/moods as clickable cards.
 *
 * @param {Object} props
 * @param {function} props.onSelect - Callback when a category is selected.
 * @returns {JSX.Element}
 */
export default function CategoryTiles({ onSelect }) {
  return (
    <section className="category-tiles-section">
      <div className="section-header">
        <h2 className="category-tiles-title">
          <span className="icon">😋</span> Explore by Mood
        </h2>
        <p className="section-subtitle">Find recipes that match your current cravings</p>
      </div>

      <div className="category-tiles-grid">
        {categories.map((cat) => (
          <motion.div
            key={cat.key}
            className="category-tile"
            style={{
              background: cat.gradient
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 10px 25px ${cat.color}66`
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => onSelect && onSelect(cat)}
            role="button"
            tabIndex={0}
            aria-label={cat.label}
          >
            <div className="category-tile-content">
              <motion.span
                className="category-tile-icon"
                aria-hidden="true"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {cat.icon}
              </motion.span>
              <div className="category-tile-text">
                <span className="category-tile-label">{cat.label}</span>
                <span className="category-tile-description">{cat.description}</span>
              </div>
            </div>
            <div className="category-tile-overlay">
              <span className="explore-text">Explore</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
