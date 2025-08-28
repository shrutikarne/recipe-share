import React from "react";
import "./Footer.scss";
import { FaTwitter, FaInstagram, FaPinterest, FaFacebook } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="footer-minimal">
            <div className="footer-minimal__container">
                <div className="footer-minimal__logo">
                    <img src="/logo192.png" alt="Recipe Share Logo" className="footer-logo" />
                    <span className="logo-text">Recipe Share</span>
                </div>

                <div className="footer-minimal__socials">
                    <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="Twitter" className="social-icon">
                        <FaTwitter />
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
