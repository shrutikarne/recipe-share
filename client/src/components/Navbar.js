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
                <div className="navbar-glass__profile">
                    <div className="navbar-glass__avatar-dropdown" ref={dropdownRef}>
                        <button
                            className="navbar-glass__avatar-btn"
                            onClick={() => setDropdownOpen((v) => !v)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            aria-label="Profile menu"
                        >
                            {user ? (
                                <img src={user.avatar || "/default-avatar.png"} alt="avatar" className="navbar-glass__avatar" />
                            ) : (
                                <div className="navbar-glass__avatar navbar-glass__avatar--default">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <span className="navbar-glass__caret" style={{ marginLeft: 6, fontSize: 16, color: '#84cc16' }}>▼</span>
                        </button>
                        {dropdownOpen && (
                            <div className="navbar-glass__dropdown">
                                {user ? (
                                    <button onClick={() => setShowLogoutModal(true)}>Logout</button>
                                ) : (
                                    <>
                                        <Link to="/login" className="navbar-glass__dropdown-link">Login</Link>
                                        <Link to="/register" className="navbar-glass__dropdown-link">Register</Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
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
