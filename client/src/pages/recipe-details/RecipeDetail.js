

import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import "./RecipeDetails.css";


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
