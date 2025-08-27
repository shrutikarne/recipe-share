import React, { useRef, useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.scss";

export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!dropdownOpen) return;
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    return (
        <>
            <nav className="navbar-glass">
                <div className="navbar-glass__logo" onClick={() => navigate("/")}>🍳 RecipeShare</div>
                <ul className="navbar-glass__links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/add-recipe">Add Recipe</Link></li>
                    <li><Link to="/categories">Categories</Link></li>
                    <li><Link to="/about">About</Link></li>
                </ul>
                <div className="navbar-glass__profile">
                    {user ? (
                        <div className="navbar-glass__avatar-dropdown" ref={dropdownRef}>
                            <button
                                className="navbar-glass__avatar-btn"
                                onClick={() => setDropdownOpen((v) => !v)}
                                aria-haspopup="true"
                                aria-expanded={dropdownOpen}
                                aria-label="Profile menu"
                            >
                                <img src={user.avatar || "/default-avatar.png"} alt="avatar" className="navbar-glass__avatar" />
                                <span className="navbar-glass__caret" style={{ marginLeft: 6, fontSize: 16, color: '#84cc16' }}>▼</span>
                            </button>
                            {dropdownOpen && (
                                <div className="navbar-glass__dropdown">
                                    <button onClick={() => setShowLogoutModal(true)}>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="navbar-glass__auth">
                            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
            <ConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    setShowLogoutModal(false);
                    setDropdownOpen(false);
                    onLogout();
                }}
                title="Log out?"
                message="We’ll miss you! 👋 Come back soon for more recipes."
                confirmText="Log out"
                cancelText="Stay"
            />
        </>
    );
}
