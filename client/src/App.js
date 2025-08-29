import About from "./pages/about/About";
/**
 * App component
 * Sets up the main routes and navigation for the Recipe Share frontend
 * - Home: lists all recipes
 * - AuthPage: combined login/register
 * - AddRecipe: add a new recipe
 * - RecipeDetail: view a single recipe
 * - Profile: user profile with their recipes and saved recipes
 * 
 * Features:
 * - Dark mode toggle
 * - Profile dropdown
 * - Logout confirmation
 * - Toast notifications
 * - Token refresh mechanism for persistent login
 */

import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./components/ConfirmModal";
import TokenRefreshManager from "./components/TokenRefreshManager";
import ErrorBoundary from "./components/ErrorBoundary";
import { showSuccessToast, toastContainerConfig } from "./utils/ToastConfig";
import API from "./api/api";
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
import Profile from "./pages/profile/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import "./components/Navbar.scss";

function Layout({ dark, setDark, loggedIn, handleSignOut, showLogoutModal, setShowLogoutModal, confirmSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddRecipe = () => {
    navigate("/add-recipe");
  };

  const isProfilePage = location.pathname === "/profile";

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
      {loggedIn && isProfilePage && (
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
            <PrivateRoute>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
              >
                <AddRecipe />
              </motion.div>
            </PrivateRoute>
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
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
              >
                <Profile />
              </motion.div>
            </PrivateRoute>
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
  const [loggedIn, setLoggedIn] = useState(() => {
    // Check if authenticated in session storage
    return sessionStorage.getItem("isAuthenticated") === "true";
  });
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
    // Call the logout API function to clear the HTTP-only cookie
    API.logout()
      .then(() => {
        // Use the token utility function to clear local session state
        import("./utils/tokenManager").then(({ setLoggedOut }) => {
          setLoggedOut();
          setLoggedIn(false);
          setShowLogoutModal(false);
          showSuccessToast("👋 We'll miss you! Come back soon for more recipes.");
          window.location.href = "/";
        });
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        // Even if the server-side logout fails, clear local state
        import("./utils/tokenManager").then(({ setLoggedOut }) => {
          setLoggedOut();
          setLoggedIn(false);
          setShowLogoutModal(false);
          window.location.href = "/";
        });
      });
  };

  // User authentication state
  const [user, setUser] = useState(null);

  // Load user data when component mounts or auth status changes
  useEffect(() => {
    // Import and use the token utility functions
    import("./utils/tokenManager").then(({ isAuthenticated, getUserId }) => {
      if (isAuthenticated()) {
        const userId = getUserId();
        // In a real app, you might want to fetch additional user data from the API
        setUser({ id: userId || "user-123", avatar: null });
        setLoggedIn(true);
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    });

    // Listen for storage events (in case authentication status changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated') {
        const isAuthenticated = e.newValue === 'true';
        setLoggedIn(isAuthenticated);
        if (!isAuthenticated) {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <BrowserRouter>
        {/* TokenRefreshManager handles token refresh in the background */}
        {loggedIn && <TokenRefreshManager />}
        <Navbar user={user} onLogout={handleLogout} />
        <div className={`app ${dark ? "dark" : ""}`}>
          <ToastContainer
            {...toastContainerConfig}
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
    </ErrorBoundary>
  );
}

export default App;
