/**
 * Admin Panel for personal recipe management
 * Allows admin to login, create, update, and delete recipes
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../utils/ToastConfig";
import API from "../../api/api";
import "./AdminPanel.scss";

function AdminPanel() {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = localStorage.getItem("adminToken") !== null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showErrorToast(data.msg || "Login failed");
        return;
      }

      // Store the token
      localStorage.setItem("adminToken", data.token);
      showSuccessToast("Admin login successful!");
      
      // Update parent component
      window.dispatchEvent(new Event("storagechange"));
      
      navigate("/add-recipe");
    } catch (error) {
      showErrorToast("Login error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-content">
          <h1>Admin Dashboard</h1>
          <p>You are logged in as admin.</p>
          <div className="admin-actions">
            <button onClick={() => navigate("/add-recipe")} className="btn btn-primary">
              Add New Recipe
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem("adminToken");
                window.dispatchEvent(new Event("storagechange"));
                navigate("/");
              }} 
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-content">
        <h1>Admin Login</h1>
        <form onSubmit={handleAdminLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;
