import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.scss";
import { TEXT } from "../../localization/text";

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
    const navigate = useNavigate();
    // Scroll to the browse section on the Home page
    const handleExploreClick = () => {
        if (window.location.pathname === "/") {
            const el = document.getElementById("browse-all-recipes-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/#browse-all-recipes-section");
        }
    };
    return (
        <div className="about-section">
            <h1>
                <span role="img" aria-label="leaf">🌿</span> {TEXT.about.heading}
            </h1>
            <p className="about-intro">{TEXT.about.intro}</p>
            <div className="about-list">
                <ul>
                  {TEXT.about.list.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
            </div>
            <p className="about-note">{TEXT.about.note}</p>
            <button
                className="about-cta"
                onClick={handleExploreClick}
            >
                <span role="img" aria-label="explore">👉</span> {TEXT.about.cta}
            </button>
        </div>
    );
}
