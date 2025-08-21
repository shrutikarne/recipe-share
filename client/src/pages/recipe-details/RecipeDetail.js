import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import "./RecipeDetails.css";

/**
 * Retrieves the user payload from the JWT token stored in localStorage.
 * @returns {object|null} The user payload object if token exists and is valid, otherwise null.
 */
function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Formats a date string into a relative time ago string (e.g., '2h ago', '3d ago').
 * @param {string|Date} dateString - The date string or Date object to format.
 * @returns {string} The formatted relative time string.
 */
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/**
 * RecipeDetail component
 * Fetches and displays details for a single recipe by ID, allows editing, deleting, and commenting.
 * @component
 */
function RecipeDetail() {
  // --- State ---
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const user = getUserFromToken();

  // --- Data Fetching (in order of appearance) ---
  // 1. Recipe details
  useEffect(() => {
    API.get(`/recipes/${id}`)
      .then((res) => {
        setRecipe(res.data);
        setEditForm(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Recipe not found");
        setLoading(false);
      });
  }, [id]);

  // 2. Comments
  useEffect(() => {
    API.get(`/recipes/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => setComments([]));
  }, [id]);

  // --- Handlers (in order of appearance) ---
  // Edit form handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditArrayChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value.split(",") }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/recipes/${id}`, editForm);
      setRecipe(res.data);
      setEditMode(false);
      alert("Recipe updated");
    } catch (err) {
      alert(err.response?.data?.msg || "Error updating recipe");
    }
  };
  // Delete handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await API.delete(`/recipes/${id}`);
      alert("Recipe deleted");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Error deleting recipe");
    }
  };
  // Comment form handler
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await API.post(`/recipes/${id}/comments`, {
        text: commentText,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      alert(err.response?.data?.msg || "Error posting comment");
    }
    setCommentLoading(false);
  };

  // --- Render logic (in order of appearance) ---
  if (loading)
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>;
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error}
      </div>
    );
  if (!recipe) return null;

  return (
    <div className="recipe-details-container">
      {editMode ? (
        <form onSubmit={handleEditSubmit}>
          <h2 className="recipe-details-title">Edit Recipe</h2>
          <div className="recipe-details-section">
            <label>Title</label>
            <input
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
            />
          </div>
          <div className="recipe-details-section">
            <label>Description</label>
            <input
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
            />
          </div>
          <div className="recipe-details-section">
            <label>Category</label>
            <input
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
            />
          </div>
          <div className="recipe-details-section">
            <label>Cook Time (min)</label>
            <input
              name="cookTime"
              type="number"
              value={editForm.cookTime}
              onChange={handleEditChange}
            />
          </div>
          <div className="recipe-details-section">
            <label>Image URL</label>
            <input
              name="imageUrl"
              value={editForm.imageUrl}
              onChange={handleEditChange}
            />
          </div>
          <div className="recipe-details-section">
            <label>Ingredients (comma separated)</label>
            <input
              name="ingredients"
              value={editForm.ingredients}
              onChange={handleEditArrayChange}
            />
          </div>
          <div className="recipe-details-section">
            <label>Steps (comma separated)</label>
            <input
              name="steps"
              value={editForm.steps}
              onChange={handleEditArrayChange}
            />
          </div>
          <div className="recipe-details-actions">
            <button className="recipe-details-btn" type="submit">
              Save
            </button>
            <button
              className="recipe-details-btn delete"
              type="button"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="recipe-details-title">{recipe.title}</h2>
          <div className="recipe-details-meta">
            <span>
              <strong>Category:</strong> {recipe.category}
            </span>
            <span>
              <strong>Cook Time:</strong> {recipe.cookTime} min
            </span>
          </div>
          {recipe.imageUrl && (
            <img
              className="recipe-details-image"
              src={recipe.imageUrl}
              alt={recipe.title}
            />
          )}
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Description</div>
            <div className="recipe-details-description">
              {recipe.description}
            </div>
          </div>
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Ingredients</div>
            <ul className="recipe-details-list">
              {recipe.ingredients &&
                recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Steps</div>
            <ol className="recipe-details-list">
              {recipe.steps &&
                recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
          {/* Comments Section */}
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Comments</div>
            <div className="comments-list">
              {comments.length === 0 && (
                <div style={{ color: "#888" }}>No comments yet.</div>
              )}
              {comments.map((c, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-user">
                    <strong>{c.username || c.user || "User"}</strong>:
                  </div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-date">
                    {c.createdAt ? timeAgo(c.createdAt) : ""}
                  </div>
                </div>
              ))}
            </div>
            {user ? (
              <form
                className="comment-form"
                onSubmit={handleCommentSubmit}
                style={{ marginTop: 16 }}
              >
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  style={{ width: "100%", resize: "vertical" }}
                  disabled={commentLoading}
                />
                <button
                  className="recipe-details-btn"
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  style={{ marginTop: 8 }}
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </form>
            ) : (
              <div style={{ color: "#888", marginTop: 8 }}>
                Log in to post a comment.
              </div>
            )}
          </div>
          {/* Always show edit/delete buttons (original behavior) */}
          <div className="recipe-details-actions">
            <button
              className="recipe-details-btn"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
            <button
              className="recipe-details-btn delete"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default RecipeDetail;
// client/src/pages/recipe-details/RecipeDetail.js
// This page displays details of a single recipe, allows editing and deleting if the user is the
