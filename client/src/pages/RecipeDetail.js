import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useParams, useNavigate } from "react-router-dom";


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
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 24 }}>
      {editMode ? (
        <form onSubmit={handleEditSubmit}>
          <h2>Edit Recipe</h2>
          <label>Title</label>
          <input name="title" value={editForm.title} onChange={handleEditChange} />
          <label>Description</label>
          <input name="description" value={editForm.description} onChange={handleEditChange} />
          <label>Category</label>
          <input name="category" value={editForm.category} onChange={handleEditChange} />
          <label>Cook Time (min)</label>
          <input name="cookTime" type="number" value={editForm.cookTime} onChange={handleEditChange} />
          <label>Image URL</label>
          <input name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} />
          <label>Ingredients (comma separated)</label>
          <input name="ingredients" value={editForm.ingredients} onChange={handleEditArrayChange} />
          <label>Steps (comma separated)</label>
          <input name="steps" value={editForm.steps} onChange={handleEditArrayChange} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditMode(false)} style={{marginLeft:8}}>Cancel</button>
        </form>
      ) : (
        <>
          <h2>{recipe.title}</h2>
          <p><strong>Description:</strong> {recipe.description}</p>
          <p><strong>Category:</strong> {recipe.category}</p>
          <p><strong>Cook Time:</strong> {recipe.cookTime} min</p>
          {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} style={{maxWidth:'100%',marginBottom:16}} />}
          <div>
            <strong>Ingredients:</strong>
            <ul>
              {recipe.ingredients && recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
          <div>
            <strong>Steps:</strong>
            <ol>
              {recipe.steps && recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
          <div style={{marginTop:24}}>
            <button onClick={() => setEditMode(true)} style={{marginRight:8}}>Edit</button>
            <button onClick={handleDelete} style={{background:'#e53935',color:'#fff'}}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default RecipeDetail;
