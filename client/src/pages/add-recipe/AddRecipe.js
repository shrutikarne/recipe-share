import React, { useState } from "react";
import API from "../../api/api";
import "./AddRecipe.css";

/**
 * AddRecipe component
 * Renders a form for users to add a new recipe and submits it to the backend API.
 */

function AddRecipe() {
  /**
   * State for the recipe form fields
   */
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: [],
    steps: [],
    category: "",
    cookTime: 0,
    imageUrl: "",
  });

  /**
   * Handles changes to text/number input fields (except ingredients and steps)
   * @param {object} e - The input change event
   */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Handles form submission, sends recipe data to backend
   * @param {object} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/recipes", form); // Send POST request to backend
      alert("Recipe added!");
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding recipe");
    }
  };

  return (
    <form className="add-recipe-form" onSubmit={handleSubmit}>
      <h2>Add Recipe</h2>
      <label htmlFor="title">Title</label>
      <input
        id="title"
        name="title"
        placeholder="Title"
        onChange={handleChange}
      />

      <label htmlFor="description">Description</label>
      <input
        id="description"
        name="description"
        placeholder="Description"
        onChange={handleChange}
      />

      <label htmlFor="category">Category</label>
      <input
        id="category"
        name="category"
        placeholder="Category"
        onChange={handleChange}
      />

      <label htmlFor="imageUrl">Image URL</label>
      <input
        id="imageUrl"
        name="imageUrl"
        placeholder="Image URL"
        onChange={handleChange}
      />

      <label htmlFor="ingredients">Ingredients (comma separated)</label>
      <input
        id="ingredients"
        name="ingredients"
        placeholder="e.g. flour, sugar, eggs"
        onChange={(e) =>
          setForm({ ...form, ingredients: e.target.value.split(",") })
        }
      />

      <label htmlFor="steps">Steps (comma separated)</label>
      <input
        id="steps"
        name="steps"
        placeholder="e.g. mix, bake, serve"
        onChange={(e) => setForm({ ...form, steps: e.target.value.split(",") })}
      />

      <label htmlFor="cookTime">Cook Time (min)</label>
      <input
        id="cookTime"
        name="cookTime"
        type="number"
        placeholder="Cook Time (min)"
        onChange={handleChange}
      />

      <button type="submit">Add Recipe</button>
    </form>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
// client/src/pages/AddRecipe.js
// This page allows users to add new recipes to the backend
