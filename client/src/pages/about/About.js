import React from "react";
import "./About.scss";

/**
 * About page component.
 *
 * Displays a friendly introduction, a list of what users can expect, and a call-to-action button
 * to start exploring recipes. Uses inline styles for a minimalist, centered layout.
 *
 * @component
 * @returns {JSX.Element} The rendered About page.
 */


export default function About() {
    // Scroll to the browse section on the Home page
    const handleExploreClick = () => {
        // If on home, scroll to recipesRef; otherwise, navigate to home and scroll after mount
        if (window.location.pathname === "/") {
            const el = document.getElementById("browse-all-recipes-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            window.location.href = "/#browse-all-recipes-section";
        }
    };
    return (
        <div className="about-section">
            <h1>
                <span role="img" aria-label="leaf">🌿</span> About Me
            </h1>
            <p className="about-intro">
                Cooking, to me, is more than just recipes—it’s about creating memories, celebrating family, and sharing love through food. This space is where flavors meet stories, where quick weeknight meals sit alongside special treats, and where inspiration comes from everyday life and travels.
            </p>
            <div className="about-list">
                <ul>
                    <li>🍲 Easy, comforting recipes</li>
                    <li>🥗 Healthy twists on classics</li>
                    <li>🍪 Sweet treats for every mood</li>
                    <li>👩‍👧 Little slices of family life & joy</li>
                </ul>
            </div>
            <p className="about-note">
                ✨ Grab a recipe, try it in your kitchen, and make it your own.
            </p>
            <button
                className="about-cta"
                onClick={handleExploreClick}
            >
                <span role="img" aria-label="explore">👉</span> Start Exploring Recipes
            </button>
        </div>
    );
}
