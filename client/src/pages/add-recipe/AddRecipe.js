import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "./AddRecipe.css";

/**
 * AddRecipe component
 * Renders a form for users to add a new recipe and submits it to the backend API.
 * @component
 */
function AddRecipe() {
  // --- State ---
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: [],
    steps: [],
    category: "",
    cookTime: 0,
    imageUrl: "",
  });
  const navigate = useNavigate(); // Redirect after adding recipe

  // --- Handlers (in order of user flow) ---
  /**
   * Handles changes to text/number input fields (except ingredients and steps)
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Handles changes to the ingredients field (comma separated).
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleIngredientsChange = (e) =>
    setForm({ ...form, ingredients: e.target.value.split(",") });

  /**
   * Handles changes to the steps field (comma separated).
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleStepsChange = (e) =>
    setForm({ ...form, steps: e.target.value.split(",") });

  /**
   * Handles form submission, sends recipe data to backend
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/recipes", form);
      alert("Recipe added!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding recipe");
    }
  };

  // --- Render logic (in order of user flow) ---
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
        placeholder="JPG/PNG, 800x450px"
        onChange={handleChange}
      />

      <label htmlFor="ingredients">Ingredients (comma separated)</label>
      <input
        id="ingredients"
        name="ingredients"
        placeholder="e.g. flour, sugar, eggs"
        onChange={handleIngredientsChange}
      />

      <label htmlFor="steps">Steps (comma separated)</label>
      <input
        id="steps"
        name="steps"
        placeholder="e.g. mix, bake, serve"
        onChange={handleStepsChange}
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
