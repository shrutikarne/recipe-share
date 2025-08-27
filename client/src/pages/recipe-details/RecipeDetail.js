import RecipeStoryView from "../../components/RecipeStoryView";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CookingMode from "../../components/CookingMode";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import "./RecipeDetails.scss";

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
function RecipeDetail(props) {
  // --- State ---
  // Accept id as a prop (for modal usage), fallback to useParams if not provided
  const params = useParams();
  const id = props.id || params.id;
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
    // Combine hours and minutes into total seconds for cookTime
    const cookTime =
      (parseInt(editForm.cookHours) || 0) * 3600 +
      (parseInt(editForm.cookMinutes) || 0) * 60;
    const updatedForm = { ...editForm, cookTime };
    delete updatedForm.cookHours;
    delete updatedForm.cookMinutes;
    try {
      const res = await API.put(`/recipes/${id}`, updatedForm);
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
  const [cookingMode, setCookingMode] = useState(false);
  const [storyMode, setStoryMode] = useState(false);
  if (loading)
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>;
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error}
      </div>
    );
  if (!recipe) return null;
  if (storyMode) {
    return (
      <RecipeStoryView
        storySteps={recipe.storySteps || []}
        onExit={() => setStoryMode(false)}
      />
    );
  }
  if (cookingMode) {
    return (
      <CookingMode
        steps={recipe.steps || []}
        stepImages={recipe.stepImages || []}
        onExit={() => setCookingMode(false)}
      />
    );
  }
  // --- HERO SECTION ---
  const heroImage = recipe?.imageUrl || (recipe?.imageUrls && recipe.imageUrls[0]);

  return (
    <>
      {/* HERO SECTION */}
      {heroImage && (
        <div className="recipe-hero">
          <div
            className="recipe-hero__bg"
            style={{ backgroundImage: `url('${heroImage}')` }}
          >
            <div className="recipe-hero__overlay" />
            <div className="recipe-hero__content">
              <h1 className="recipe-hero__title">{recipe.title}</h1>
              <div className="recipe-hero__actions">
                <button
                  className="recipe-hero__btn recipe-hero__btn--save"
                  onClick={() => alert('Save functionality coming soon!')}
                >
                  Save Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <motion.div
        className="recipe-details"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <button
          className="recipe-details__btn recipe-details__btn--cookingmode"
          style={{ width: '100%', fontSize: 22, padding: '18px 0', margin: '24px 0', background: '#22c55e', color: '#fff', borderRadius: 12, fontWeight: 700, letterSpacing: 1 }}
          onClick={() => setCookingMode(true)}
        >
          🍳 Cooking Mode
        </button>
        {editMode ? (
          <form className="add-recipe-form" onSubmit={handleEditSubmit}>
            <h2 className="add-recipe-form__h2">Edit Recipe</h2>
            <label className="add-recipe-form__label" htmlFor="title">
              Title
            </label>
            <input
              className="add-recipe-form__input"
              id="title"
              name="title"
              placeholder="Title"
              value={editForm.title}
              onChange={handleEditChange}
            />

            <label className="add-recipe-form__label" htmlFor="description">
              Description
            </label>
            <input
              className="add-recipe-form__input"
              id="description"
              name="description"
              placeholder="Description"
              value={editForm.description}
              onChange={handleEditChange}
            />

            <label className="add-recipe-form__label" htmlFor="category">
              Category
            </label>
            <select
              className="add-recipe-form__select"
              id="category"
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
            >
              <option value="">Select category</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
              <option value="Beverage">Beverage</option>
              <option value="Other">Other</option>
            </select>

            <label className="add-recipe-form__label" htmlFor="diet">
              Diet Type
            </label>
            <select
              className="add-recipe-form__select"
              id="diet"
              name="diet"
              value={editForm.diet || ""}
              onChange={handleEditChange}
            >
              <option value="">Select diet type</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="omnivore">Omnivore</option>
              <option value="other">Other</option>
            </select>

            <label className="add-recipe-form__label" htmlFor="imageUrl">
              Add Image
            </label>
            <input
              className="add-recipe-form__input"
              id="imageUrl"
              name="imageUrl"
              placeholder="JPG/PNG, 800x450px"
              value={editForm.imageUrl}
              onChange={handleEditChange}
            />

            <label className="add-recipe-form__label" htmlFor="ingredients">
              Ingredients (comma separated)
            </label>
            <input
              className="add-recipe-form__input"
              id="ingredients"
              name="ingredients"
              placeholder="e.g. flour, sugar, eggs"
              value={
                Array.isArray(editForm.ingredients)
                  ? editForm.ingredients.join(",")
                  : editForm.ingredients
              }
              onChange={handleEditArrayChange}
            />

            <label className="add-recipe-form__label" htmlFor="steps">
              Steps (comma separated)
            </label>
            <input
              className="add-recipe-form__input"
              id="steps"
              name="steps"
              placeholder="e.g. mix, bake, serve"
              value={
                Array.isArray(editForm.steps)
                  ? editForm.steps.join(",")
                  : editForm.steps
              }
              onChange={handleEditArrayChange}
            />

            <label className="add-recipe-form__label">Cook Time</label>
            <div className="add-recipe-form__cooktime-row">
              <input
                className="add-recipe-form__input add-recipe-form__input--cooktime"
                type="number"
                min="0"
                value={
                  editForm.cookHours !== undefined
                    ? editForm.cookHours
                    : editForm.cookTime
                      ? Math.floor(editForm.cookTime / 3600)
                      : ""
                }
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    cookHours:
                      e.target.value === ""
                        ? ""
                        : e.target.value.replace(/^0+(?!$)/, ""),
                  }))
                }
                placeholder="Hrs"
              />
              <input
                className="add-recipe-form__input add-recipe-form__input--cooktime"
                type="number"
                min="0"
                max="59"
                value={
                  editForm.cookMinutes !== undefined
                    ? editForm.cookMinutes
                    : editForm.cookTime
                      ? Math.floor((editForm.cookTime % 3600) / 60)
                      : ""
                }
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    cookMinutes:
                      e.target.value === ""
                        ? ""
                        : e.target.value.replace(/^0+(?!$)/, ""),
                  }))
                }
                placeholder="Min"
              />
            </div>

            <button className="add-recipe-form__button" type="submit">
              Save
            </button>
            <button
              className="add-recipe-form__button add-recipe-form__button--cancel"
              type="button"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <h2 className="recipe-details__title">{recipe.title}</h2>
            <div className="recipe-details__meta">
              <span>
                <strong>Category:</strong> {recipe.category}
              </span>
              <span>
                <strong>Cook Time:</strong> {recipe.cookTime} min
              </span>
            </div>
            {recipe.imageUrl && (
              <img
                className="recipe-details__image"
                src={recipe.imageUrl}
                alt={recipe.title}
              />
            )}
            <div className="recipe-details__section">
              <div className="recipe-details__section-title">Description</div>
              <div className="recipe-details__description">
                {recipe.description}
              </div>
            </div>
            <div className="recipe-details__section">
              <div className="recipe-details__section-title">Ingredients</div>
              <ul className="recipe-details__list">
                {recipe.ingredients &&
                  recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
            <div className="recipe-details__section">
              <div className="recipe-details__section-title">Steps</div>
              <ol className="recipe-details__list">
                {recipe.steps &&
                  recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              {recipe.storySteps && recipe.storySteps.length > 0 && (
                <button
                  className="recipe-details__btn"
                  style={{ marginTop: 12, background: "#facc15", color: "#222" }}
                  onClick={() => setStoryMode(true)}
                >
                  View as Story
                </button>
              )}
            </div>
            {/* Comments Section */}
            <div className="recipe-details__section">
              <div className="recipe-details__section-title">Comments</div>
              <div className="recipe-details__comments-list">
                {comments.length === 0 && (
                  <div className="recipe-details__no-comments">
                    No comments yet.
                  </div>
                )}
                {comments.map((c, i) => (
                  <div key={i} className="recipe-details__comment-item">
                    <div className="recipe-details__comment-user">
                      <strong>{c.username || c.user || "User"}</strong>:
                    </div>
                    <div className="recipe-details__comment-text">{c.text}</div>
                    <div className="recipe-details__comment-date">
                      {c.createdAt ? timeAgo(c.createdAt) : ""}
                    </div>
                  </div>
                ))}
              </div>
              {user ? (
                <form
                  className="recipe-details__comment-form"
                  onSubmit={handleCommentSubmit}
                >
                  <textarea
                    className="recipe-details__comment-textarea"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    disabled={commentLoading}
                  />
                  <button
                    className="recipe-details__btn"
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                  >
                    {commentLoading ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              ) : (
                <div className="recipe-details__login-message">
                  Log in to post a comment.
                </div>
              )}
            </div>
            {/* Always show edit/delete buttons (original behavior) */}
            <div className="recipe-details__actions">
              <button
                className="recipe-details__btn"
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
              <button
                className="recipe-details__btn recipe-details__btn--delete"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </>
        )}

      </motion.div>
    </>
  );
}

export default RecipeDetail;
// client/src/pages/recipe-details/RecipeDetail.js
// This page displays details of a single recipe, allows editing and deleting if the user is the
