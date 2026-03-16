/**
 * Admin Panel for personal recipe management
 * Allows admin to login, create, update, and delete recipes
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../utils/ToastConfig";
import API from "../../api/api";
import "./AdminPanel.scss";

const notifyAdminChange = () => window.dispatchEvent(new Event("admin-auth-changed"));

function AdminPanel() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = localStorage.getItem("adminToken") !== null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/admin/login", { password });

      if (!data?.token) {
        showErrorToast("Login failed");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      notifyAdminChange();
      setPassword("");
      showSuccessToast("Admin login successful!");
      navigate("/add-recipe");
    } catch (error) {
      const message = error.response?.data?.msg || error.message || "Login failed";
      showErrorToast(message);
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
                notifyAdminChange();
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
