// CategoryTiles.js - stylish category/mood cards for explore section
import React from "react";
import { motion } from "framer-motion";

const categories = [
  { key: "quick", label: "Quick & Easy", icon: "⚡" },
  { key: "vegetarian", label: "Vegetarian", icon: "🌱" },
  { key: "desserts", label: "Desserts", icon: "🍰" },
  { key: "dinner2", label: "Dinner for Two", icon: "❤️" },
  { key: "snacks", label: "Snacks", icon: "🥨" },
  { key: "breakfast", label: "Breakfast", icon: "🥞" },
  { key: "beverage", label: "Beverages", icon: "🥤" },
  { key: "soup", label: "Soups", icon: "🍲" },
];

export default function CategoryTiles({ onSelect }) {
  return (
    <section className="category-tiles-section">
      <h2 className="category-tiles-title">Explore by Mood</h2>
      <div className="category-tiles-grid">
        {categories.map((cat) => (
          <motion.button
            key={cat.key}
            className="category-tile"
            whileHover={{ scale: 1.08, boxShadow: "0 8px 32px #0ea5e9cc" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            onClick={() => onSelect && onSelect(cat)}
            aria-label={cat.label}
          >
            <span className="category-tile-icon" aria-hidden="true">{cat.icon}</span>
            <span className="category-tile-label">{cat.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
