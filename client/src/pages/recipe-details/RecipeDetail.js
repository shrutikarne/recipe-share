


import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import "./RecipeDetails.css";

// Helper to get user from JWT (copied from Home.js)
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
 * RecipeDetail component
 * Fetches and displays details for a single recipe by ID
 */


function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const user = getUserFromToken();

  // Fetch comments on mount or id change
  useEffect(() => {
    API.get(`/recipes/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => setComments([]));
  }, [id]);

  // Handle comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await API.post(`/recipes/${id}/comments`, { text: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      alert(err.response?.data?.msg || "Error posting comment");
    }
    setCommentLoading(false);
  };

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
      const res = await API.put(`/recipes/${id}`,
        editForm
      );
      setRecipe(res.data);
      setEditMode(false);
      alert("Recipe updated");
    } catch (err) {
      alert(err.response?.data?.msg || "Error updating recipe");
    }
  };

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Loading...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:40}}>{error}</div>;
  if (!recipe) return null;

  return (
    <div className="recipe-details-container">
      {editMode ? (
        <form onSubmit={handleEditSubmit}>
          <h2 className="recipe-details-title">Edit Recipe</h2>
          {/* ...existing code for edit form... */}
          <div className="recipe-details-section">
            <label>Title</label>
            <input name="title" value={editForm.title} onChange={handleEditChange} />
          </div>
          <div className="recipe-details-section">
            <label>Description</label>
            <input name="description" value={editForm.description} onChange={handleEditChange} />
          </div>
          <div className="recipe-details-section">
            <label>Category</label>
            <input name="category" value={editForm.category} onChange={handleEditChange} />
          </div>
          <div className="recipe-details-section">
            <label>Cook Time (min)</label>
            <input name="cookTime" type="number" value={editForm.cookTime} onChange={handleEditChange} />
          </div>
          <div className="recipe-details-section">
            <label>Image URL</label>
            <input name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} />
          </div>
          <div className="recipe-details-section">
            <label>Ingredients (comma separated)</label>
            <input name="ingredients" value={editForm.ingredients} onChange={handleEditArrayChange} />
          </div>
          <div className="recipe-details-section">
            <label>Steps (comma separated)</label>
            <input name="steps" value={editForm.steps} onChange={handleEditArrayChange} />
          </div>
          <div className="recipe-details-actions">
            <button className="recipe-details-btn" type="submit">Save</button>
            <button className="recipe-details-btn delete" type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="recipe-details-title">{recipe.title}</h2>
          <div className="recipe-details-meta">
            <span><strong>Category:</strong> {recipe.category}</span>
            <span><strong>Cook Time:</strong> {recipe.cookTime} min</span>
          </div>
          {recipe.imageUrl && <img className="recipe-details-image" src={recipe.imageUrl} alt={recipe.title} />}
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Description</div>
            <div className="recipe-details-description">{recipe.description}</div>
          </div>
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Ingredients</div>
            <ul className="recipe-details-list">
              {recipe.ingredients && recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Steps</div>
            <ol className="recipe-details-list">
              {recipe.steps && recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
          {/* Comments Section */}
          <div className="recipe-details-section">
            <div className="recipe-details-section-title">Comments</div>
            <div className="comments-list">
              {comments.length === 0 && <div style={{color:'#888'}}>No comments yet.</div>}
              {comments.map((c, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-user"><strong>{c.username || c.user || 'User'}</strong>:</div>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-date">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
            {user ? (
              <form className="comment-form" onSubmit={handleCommentSubmit} style={{marginTop:16}}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  style={{width:'100%',resize:'vertical'}}
                  disabled={commentLoading}
                />
                <button className="recipe-details-btn" type="submit" disabled={commentLoading || !commentText.trim()} style={{marginTop:8}}>
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div style={{color:'#888',marginTop:8}}>Log in to post a comment.</div>
            )}
          </div>
          {/* Always show edit/delete buttons (original behavior) */}
          <div className="recipe-details-actions">
            <button className="recipe-details-btn" onClick={() => setEditMode(true)}>Edit</button>
            <button className="recipe-details-btn delete" onClick={handleDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default RecipeDetail;
// client/src/pages/recipe-details/RecipeDetail.js
// This page displays details of a single recipe, allows editing and deleting if the user is the
