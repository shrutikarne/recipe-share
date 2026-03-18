import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { TEXT } from "../localization/text";
import { DefaultAvatarIcon } from "./SvgIcons";

/**
 * Navbar component for the Personal Recipe Sharing Website.
 * Shows brand navigation plus an avatar dropdown reflecting admin status.
 *
 * @param {{isAdmin: boolean, onAdminLogout: () => void}} props - Component props.
 * @returns {JSX.Element} Sticky nav with profile dropdown controls.
 */
export default function Navbar({ isAdmin, onAdminLogout }) {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const avatarButtonRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        if (!dropdownOpen) return;

        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                avatarButtonRef.current &&
                !avatarButtonRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    /**
     * Toggle the visibility of the profile dropdown menu.
     * @returns {void}
     */
    const toggleDropdown = () => {
        setDropdownOpen(prevState => !prevState);
    };

    return (
        <>
            <nav className="navbar-glass">
                <div className="navbar-glass__logo" onClick={() => navigate("/")}>🍳 {TEXT.navbar.logo}</div>
                <div className="navbar-glass__profile">
                    <div className="navbar-glass__avatar-dropdown" ref={dropdownRef}>
                        <div
                            ref={avatarButtonRef}
                            className="navbar-glass__avatar-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleDropdown();
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            {isAdmin ? (
                                <div className="navbar-glass__avatar navbar-glass__avatar--admin">
                                    <span style={{ fontSize: '20px' }}>👤</span>
                                </div>
                            ) : (
                                <div className="navbar-glass__avatar navbar-glass__avatar--default">
                                    <DefaultAvatarIcon />
                                </div>
                            )}
                            <span className="navbar-glass__caret" style={{ marginLeft: 6, fontSize: 16, color: '#84cc16' }}>▼</span>
                        </div>

                        {dropdownOpen && (
                            <div
                                className="navbar-glass__dropdown"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isAdmin ? (
                                    <>
                                        <Link to="/add-recipe" className="navbar-glass__dropdown-link">Add Recipe</Link>
                                        <button onClick={() => { setDropdownOpen(false); onAdminLogout(); }}>Logout</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/admin" className="navbar-glass__dropdown-link">Admin</Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
