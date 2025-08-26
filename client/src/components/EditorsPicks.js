// EditorsPicks.js - personalized or editor's picks section
import React from "react";
import { motion } from "framer-motion";

export default function EditorsPicks({ recipes, title = "👩‍🍳 Editor's Picks" }) {
  if (!recipes || recipes.length === 0) return null;
  return (
    <section className="editors-picks-section">
      <h2 className="editors-picks-title">{title}</h2>
      <div className="editors-picks-grid">
        {recipes.map((r) => (
          <motion.div
            className="editors-picks-card"
            key={r._id}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px #0ea5e9cc" }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <img src={r.imageUrl || (r.imageUrls && r.imageUrls[0])} alt={r.title} className="editors-picks-img" />
            <div className="editors-picks-info">
              <div className="editors-picks-title-row">{r.title}</div>
              <div className="editors-picks-desc">{r.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
