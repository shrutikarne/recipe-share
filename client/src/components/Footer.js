import React from "react";
import "./Footer.scss";
import { FaInstagram, FaPinterest, FaFacebook } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="footer-minimal">
            <div className="footer-minimal__container">
                <div className="footer-minimal__logo">
                    <img src="/logo192.png" alt="Recipe Share Logo" className="footer-logo" />
                    <span className="logo-text">Recipe Share</span>
                </div>

                <div className="footer-minimal__links">
                    <a href="/" className="footer-link">Home</a>
                    <a href="/about" className="footer-link">About</a>
                </div>

                <div className="footer-minimal__socials">
                    <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="X (formerly Twitter)" className="social-icon">
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
                            <path d="M17.53 3H21.5L14.88 10.39L22.68 21H16.08L11.23 14.73L5.77 21H1.8L8.78 13.13L1.27 3H8.03L12.41 8.67L17.53 3ZM16.32 19H18.14L7.78 4.82H5.82L16.32 19Z" />
                        </svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer noopener" aria-label="Instagram" className="social-icon">
                        <FaInstagram />
                    </a>
                    <a href="https://pinterest.com" target="_blank" rel="noreferrer noopener" aria-label="Pinterest" className="social-icon">
                        <FaPinterest />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="social-icon">
                        <FaFacebook />
                    </a>
                </div>
            </div>
            <div className="footer-minimal__copyright">
                &copy; {new Date().getFullYear()} Recipe Share. All rights reserved.
            </div>
        </footer>
    );
}
