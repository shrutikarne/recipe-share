import About from "./pages/about/About";
/**
 * App component
 * Sets up the main routes and navigation for the Recipe Share frontend
 * - Home: lists all recipes
 * - AuthPage: combined login/register
 * - AddRecipe: add a new recipe
 * - RecipeDetail: view a single recipe
 * 
 * Features:
 * - Dark mode toggle
 * - Profile dropdown
 * - Logout confirmation
 * - Toast notifications
 */

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./components/ConfirmModal";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./App.scss";
import Home from "./pages/home/Home";
import AuthPage from "./pages/authentication/AuthPage";
import AddRecipe from "./pages/add-recipe/AddRecipe";
import RecipeDetail from "./pages/recipe-details/RecipeDetail";
import Navbar from "./components/Navbar";
import "./components/Navbar.scss";

function Layout({ dark, setDark, loggedIn, handleSignOut, showLogoutModal, setShowLogoutModal, confirmSignOut }) {
  const navigate = useNavigate();

  const handleAddRecipe = () => {
    navigate("/add-recipe");
  };

  return (
    <>
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="We'll miss you! 👋 Are you sure you want to sign out?"
        confirmText="Yes, Sign Out"
        cancelText="No, Stay"
      />
      {loggedIn && (
        <button
          onClick={handleAddRecipe}
          className="fab"
          aria-label="Add a new recipe"
          title="Add new recipe"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4V20M4 12H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/auth"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <AuthPage />
            </motion.div>
          }
        />
        <Route
          path="/add-recipe"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <AddRecipe />
            </motion.div>
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <RecipeDetail />
            </motion.div>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // State hooks
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("darkMode", dark);
  }, [dark]);

  // Sign out functions
  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setShowLogoutModal(false);
    toast.info("👋 We'll miss you! Come back soon for more recipes.", {
      position: "top-center",
      autoClose: 3000
    });
    window.location.href = "/";
  };

  // User authentication state
  const [user, setUser] = useState(null);

  // Load user data when component mounts or token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, you would fetch user data from the API
      // For now, create a simple user object if token exists
      setUser({ id: "user-123", avatar: null });
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setLoggedIn(false);
    toast.info("👋 We'll miss you! Come back soon for more recipes.", {
      position: "top-center",
      autoClose: 3000
    });
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <div className={`app ${dark ? "dark" : ""}`}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={dark ? "dark" : "light"}
        />
        <Layout
          dark={dark}
          setDark={setDark}
          loggedIn={loggedIn}
          handleSignOut={handleSignOut}
          showLogoutModal={showLogoutModal}
          setShowLogoutModal={setShowLogoutModal}
          confirmSignOut={confirmSignOut}
        />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
