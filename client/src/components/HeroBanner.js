// HeroBanner.js - modern full-width hero with video/image, overlay, search, and CTAs
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeroBanner({ onSearch, search, setSearch, onBrowse, onUpload }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.src = "/hero-food.jpg";
    img.onload = () => {
      if (isMounted) {
        setLoaded(true);
      }
    };

    // Fallback if image doesn't load
    const timer = setTimeout(() => {
      if (isMounted && !loaded) {
        setLoaded(true);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [loaded]);

  return (
    <section className="hero-banner">
      <div className="hero-banner__bg">
        <img
          className="hero-banner__image"
          src="/hero-food.jpg"
          alt="Cooking table with ingredients"
        />
        <div className="hero-banner__overlay" />
      </div>
      <div className="hero-banner__content">
        <motion.h1
          className="hero-banner__title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : -20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span role="img" aria-label="bowl">🍲</span> Discover, Cook, &amp; Share Recipes with Love.
        </motion.h1>
        <motion.form
          className="hero-banner__search"
          onSubmit={onSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <input
            type="text"
            placeholder="What do you want to cook today?"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="hero-banner__search-input"
            aria-label="Search recipes"
          />
          <button type="submit" className="hero-banner__search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Search
          </button>
        </motion.form>
        <motion.div
          className="hero-banner__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <button className="hero-banner__cta" onClick={onBrowse}>Browse Recipes</button>
          <button className="hero-banner__cta hero-banner__cta--upload" onClick={onUpload}>Upload Your Own</button>
        </motion.div>
      </div>
    </section>
  );
}
