import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { TEXT } from "../localization/text";
import { DefaultAvatarIcon } from "./SvgIcons";

/**
 * Navbar component for the Recipe Share app.
 * Displays navigation, user avatar, and dropdown menu.
 *
 * @param {Object} props
 * @param {Object|null} props.user - The current user object or null if not logged in.
 * @param {function} props.onLogout - Function to call when logging out.
 * @returns {JSX.Element}
 */
export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const avatarButtonRef = useRef(null);



    // Handle click outside to close dropdown
    useEffect(() => {
        if (!dropdownOpen) return;

        function handleClickOutside(e) {
            // Only close if click is outside both dropdown and button
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

    // Toggle dropdown function
    const toggleDropdown = () => {

        setDropdownOpen(prevState => !prevState);
    };

    return (
        <>
            <nav className="navbar-glass">
                <div className="navbar-glass__logo" onClick={() => navigate("/")}>🍳 {TEXT.navbar.logo}</div>
                <div className="navbar-glass__profile">
                    <div className="navbar-glass__avatar-dropdown" ref={dropdownRef}>
                        {/* Avatar button */}
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
                            {user ? (
                                <img src={user.avatar || "/default-avatar.png"} alt="avatar" className="navbar-glass__avatar" />
                            ) : (
                                <div className="navbar-glass__avatar navbar-glass__avatar--default">
                                    <DefaultAvatarIcon />
                                </div>
                            )}
                            <span className="navbar-glass__caret" style={{ marginLeft: 6, fontSize: 16, color: '#84cc16' }}>▼</span>
                        </div>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div
                                className="navbar-glass__dropdown"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {user ? (
                                    <>
                                        <Link to="/profile" className="navbar-glass__dropdown-link">{TEXT.navbar.myProfile}</Link>
                                        <button onClick={() => { setDropdownOpen(false); onLogout(); }}>{TEXT.navbar.logout}</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/auth" className="navbar-glass__dropdown-link">{TEXT.navbar.login}</Link>
                                        <Link to="/auth" className="navbar-glass__dropdown-link">{TEXT.navbar.register}</Link>
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
