/**
 * App component
 * Sets up the main routes and navigation for the Personal Recipe Sharing Website
 * - Home: lists all recipes (public)
 * - AdminPanel: admin login and recipe management (private)
 * - RecipeDetail: view a single recipe (public)
 * - AddRecipe: add a new recipe (admin only)
 * 
 * Features:
 * - Dark mode toggle
 * - Admin authentication
 * - Toast notifications
 * - Public recipe browsing
 */

import React, { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TEXT } from "./localization/text";
import ErrorBoundary from "./components/ErrorBoundary";
import { showSuccessToast, toastContainerConfig } from "./utils/ToastConfig";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./App.scss";
import Navbar from "./components/Navbar";
import "./components/Navbar.scss";
const Home = lazy(() => import("./pages/home/Home"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));
const AddRecipe = lazy(() => import("./pages/add-recipe/AddRecipe"));
const RecipeDetail = lazy(() => import("./pages/recipe-details/RecipeDetail"));
const About = lazy(() => import("./pages/about/About"));

/**
 * Layout component for the main app shell, including navbar.
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <>
      {/* Navbar will handle admin status display */}
    </>
  );
}

/**
 * AnimatedRoutes component for handling route transitions with animation.
 * @returns {JSX.Element}
 */
function AnimatedRoutes({ isAdmin }) {
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
          path="/admin"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35 }}
            >
              <AdminPanel />
            </motion.div>
          }
        />
        <Route
          path="/add-recipe"
          element={
            isAdmin ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
              >
                <AddRecipe />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
              >
                <Home />
              </motion.div>
            )
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
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Main App component for Personal Recipe Sharing Website.
 * Handles admin authentication, theme, routing, and global state.
 * @returns {JSX.Element}
 */
const emitAdminChange = () => window.dispatchEvent(new Event("admin-auth-changed"));

function App() {
  const navigate = useNavigate();
  // State hooks
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("adminToken") !== null;
  });
  const [dark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("darkMode", dark);
  }, [dark]);

  // Handle admin logout
  const syncAdminState = useCallback(() => {
    setIsAdmin(localStorage.getItem("adminToken") !== null);
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    emitAdminChange();
    syncAdminState();
    showSuccessToast("Logged out successfully!");
    navigate("/", { replace: true });
  };

  // Listen for admin status changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'adminToken') {
        syncAdminState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin-auth-changed', syncAdminState);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-auth-changed', syncAdminState);
    };
  }, [syncAdminState]);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <Navbar isAdmin={isAdmin} onAdminLogout={handleAdminLogout} />
      <div className={`app ${dark ? "dark" : ""}`}>
        <ToastContainer
          {...toastContainerConfig}
          theme={dark ? "dark" : "light"}
        />
        <Layout />
        <Suspense fallback={<div />}> 
          <AnimatedRoutes isAdmin={isAdmin} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
