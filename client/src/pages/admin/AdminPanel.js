/**
 * Admin Panel for personal recipe management
 * Allows admin to login, create, update, and delete recipes
 */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../utils/ToastConfig";
import API from "../../api/api";
import "./AdminPanel.scss";

const notifyAdminChange = () => window.dispatchEvent(new Event("admin-auth-changed"));

function AdminPanel() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [activeDeleteId, setActiveDeleteId] = useState(null);
  const isAdmin = localStorage.getItem("adminToken") !== null;

  const fetchRecipes = useCallback(async () => {
    if (!isAdmin) return;
    setRecipesLoading(true);
    setRecipesError("");
    try {
      const { data } = await API.get("/recipes", {
        params: { limit: 100, sort: "-updatedAt" }
      });
      const incoming = Array.isArray(data?.recipes) ? data.recipes : Array.isArray(data) ? data : [];
      setRecipes(incoming);
    } catch (error) {
      setRecipesError(error.response?.data?.msg || "Unable to load recipes");
    } finally {
      setRecipesLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleDeleteRecipe = async (recipeId) => {
    if (!recipeId) return;
    const confirmed = window.confirm("Delete this recipe permanently?");
    if (!confirmed) return;

    setActiveDeleteId(recipeId);
    try {
      await API.delete(`/recipes/${recipeId}`);
      showSuccessToast("Recipe deleted");
      fetchRecipes();
    } catch (error) {
      const message = error.response?.data?.msg || "Failed to delete recipe";
      showErrorToast(message);
    } finally {
      setActiveDeleteId(null);
    }
  };

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
          <section className="admin-recipes">
            <div className="admin-recipes__header">
              <h2>Your Recipes</h2>
              <button
                type="button"
                className="admin-recipes__refresh"
                onClick={fetchRecipes}
                disabled={recipesLoading}
              >
                {recipesLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {recipesError && <div className="admin-recipes__error">{recipesError}</div>}
            {recipesLoading ? (
              <div className="admin-recipes__empty">Loading recipes...</div>
            ) : recipes.length === 0 ? (
              <div className="admin-recipes__empty">You have not added any recipes yet.</div>
            ) : (
              <div className="admin-recipes__table-wrapper">
                <table className="admin-recipes__table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe) => (
                      <tr key={recipe._id}>
                        <td>{recipe.title}</td>
                        <td>{recipe.category || "—"}</td>
                        <td>
                          {recipe.updatedAt
                            ? new Date(recipe.updatedAt).toLocaleDateString()
                            : new Date(recipe.createdAt).toLocaleDateString()}
                        </td>
                        <td className="admin-recipes__actions">
                          <button
                            type="button"
                            className="admin-recipes__action admin-recipes__action--edit"
                            onClick={() => navigate(`/edit-recipe/${recipe._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-recipes__action admin-recipes__action--delete"
                            onClick={() => handleDeleteRecipe(recipe._id)}
                            disabled={activeDeleteId === recipe._id}
                          >
                            {activeDeleteId === recipe._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
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
