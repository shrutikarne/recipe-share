import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useParams } from "react-router-dom";

/**
 * RecipeDetail component
 * Fetches and displays details for a single recipe by ID
 */
function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get(`/recipes/${id}`)
      .then((res) => {
        setRecipe(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Recipe not found");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Loading...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:40}}>{error}</div>;
  if (!recipe) return null;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 24 }}>
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
    </div>
  );
}

export default RecipeDetail;
