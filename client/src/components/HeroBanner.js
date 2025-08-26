// HeroBanner.js - full-width hero with video/image, overlay, search, and CTAs
import React from "react";
import { motion } from "framer-motion";

export default function HeroBanner({ onSearch, search, setSearch, onBrowse, onUpload }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner__bg">
        <video
          className="hero-banner__video"
          src="/hero-food.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-food.jpg"
        />
        <div className="hero-banner__overlay" />
      </div>
      <div className="hero-banner__content">
        <h1 className="hero-banner__title">
          <span role="img" aria-label="bowl">🍲</span> Discover, Cook, &amp; Share Recipes with Love.
        </h1>
        <motion.form
          className="hero-banner__search"
          onSubmit={onSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <input
            type="text"
            placeholder="What do you want to cook today?"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="hero-banner__search-input"
            aria-label="Search recipes"
          />
          <button type="submit" className="hero-banner__search-btn">Search</button>
        </motion.form>
        <div className="hero-banner__actions">
          <button className="hero-banner__cta" onClick={onBrowse}>Browse Recipes</button>
          <button className="hero-banner__cta hero-banner__cta--upload" onClick={onUpload}>Upload Your Own</button>
        </div>
      </div>
    </section>
  );
}
