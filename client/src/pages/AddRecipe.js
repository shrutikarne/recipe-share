import React, { useState } from "react";
import API from "../api/api";

function AddRecipe() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: [],
    steps: [],
    category: "",
    cookTime: 0,
    imageUrl: "",
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post("/recipes", form);
      alert("Recipe added!");
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding recipe");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Recipe</h2>
      <input name="title" placeholder="Title" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <input name="ingredients" placeholder="Ingredients (comma separated)" onChange={e => setForm({ ...form, ingredients: e.target.value.split(",") })} />
      <input name="steps" placeholder="Steps (comma separated)" onChange={e => setForm({ ...form, steps: e.target.value.split(",") })} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="cookTime" type="number" placeholder="Cook Time (min)" onChange={handleChange} />
      <input name="imageUrl" placeholder="Image URL" onChange={handleChange} />
      <button type="submit">Add Recipe</button>
    </form>
  );
}

export default AddRecipe;
// client/src/pages/AddRecipe.js
// Ensure the AddRecipe page is set up to handle adding new recipes to the backend