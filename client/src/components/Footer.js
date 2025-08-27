import React from "react";
import "./Footer.scss";

export default function Footer() {
    return (
        <footer className="footer-clean">
            <div className="footer-clean__container">
                <div className="footer-clean__links">
                    <a href="/" className="footer-clean__link">Home</a>
                    <a href="/categories" className="footer-clean__link">Categories</a>
                    <a href="/about" className="footer-clean__link">About</a>
                </div>
                <div className="footer-clean__contact">
                    <span>Contact: <a href="mailto:hello@recipeshare.com">hello@recipeshare.com</a></span>
                </div>
                <div className="footer-clean__socials">
                    <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="Twitter" className="footer-clean__icon">🐦</a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="footer-clean__icon">📸</a>
                    <a href="https://github.com" target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="footer-clean__icon">💻</a>
                </div>
            </div>
            <div className="footer-clean__copyright">
                &copy; {new Date().getFullYear()} RecipeShare. All rights reserved.
            </div>
        </footer>
    );
}
