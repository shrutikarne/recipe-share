import React from "react";
import "./Footer.scss";
import { FaInstagram, FaPinterest, FaFacebook } from "react-icons/fa";
import { TwitterIcon } from "./SvgIcons";
import { TEXT } from "../localization/text";

/**
 * Footer component for the Recipe Share app.
 * Displays navigation links and social media icons.
 * @returns {JSX.Element}
 */
export default function Footer() {
    return (
        <footer className="footer-minimal">
            <div className="footer-minimal__container">
                <div className="footer-minimal__logo">
                    <img src="/logo192.png" alt={TEXT.footer.logoAlt} className="footer-logo" />
                    <span className="logo-text">{TEXT.footer.logoText}</span>
                </div>

                <div className="footer-minimal__links">
                    <a href="/" className="footer-link">{TEXT.footer.home}</a>
                    <a href="/about" className="footer-link">{TEXT.footer.about}</a>
                </div>

                <div className="footer-minimal__socials">
                    <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="X (formerly Twitter)" className="social-icon">
                        <TwitterIcon />
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
                &copy; {new Date().getFullYear()} {TEXT.footer.copyright}
            </div>
        </footer>
    );
}
