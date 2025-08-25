import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "./AddRecipe.scss";

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
    imageUrl: "",
    diet: "",
  });
  const [cookHours, setCookHours] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
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
    // Combine hours, minutes, seconds into total seconds
    const cookTime = (parseInt(cookHours) || 0) * 3600 + (parseInt(cookMinutes) || 0);
    try {
      await API.post("/recipes", { ...form, cookTime });
      alert("Recipe added!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.msg || "Error adding recipe");
    }
  };

  // --- Render logic (in order of user flow) ---
  return (
    <form className="add-recipe-form" onSubmit={handleSubmit}>
      <h2 className="add-recipe-form__h2">Add Recipe</h2>
      <label className="add-recipe-form__label" htmlFor="title">Title</label>
      <input
        className="add-recipe-form__input"
        id="title"
        name="title"
        placeholder="Title"
        onChange={handleChange}
      />

      <label className="add-recipe-form__label" htmlFor="description">Description</label>
      <input
        className="add-recipe-form__input"
        id="description"
        name="description"
        placeholder="Description"
        onChange={handleChange}
      />

      <label className="add-recipe-form__label" htmlFor="category">Category</label>
      <select
        className="add-recipe-form__select"
        id="category"
        name="category"
        value={form.category}
        onChange={handleChange}
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

      <label className="add-recipe-form__label" htmlFor="diet">Diet Type</label>
      <select
        className="add-recipe-form__select"
        id="diet"
        name="diet"
        value={form.diet}
        onChange={handleChange}
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

      <label className="add-recipe-form__label" htmlFor="imageUrl">Add Image</label>
      <input
        className="add-recipe-form__input"
        id="imageUrl"
        name="imageUrl"
        placeholder="JPG/PNG, 800x450px"
        onChange={handleChange}
      />

      <label className="add-recipe-form__label" htmlFor="ingredients">Ingredients (comma separated)</label>
      <input
        className="add-recipe-form__input"
        id="ingredients"
        name="ingredients"
        placeholder="e.g. flour, sugar, eggs"
        onChange={handleIngredientsChange}
      />

      <label className="add-recipe-form__label" htmlFor="steps">Steps (comma separated)</label>
      <input
        className="add-recipe-form__input"
        id="steps"
        name="steps"
        placeholder="e.g. mix, bake, serve"
        onChange={handleStepsChange}
      />

      <label className="add-recipe-form__label">Cook Time</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="add-recipe-form__input"
          type="number"
          min="0"
          value={cookHours}
          onChange={e => setCookHours(e.target.value === "" ? "" : e.target.value.replace(/^0+(?!$)/, ""))}
          placeholder="Hrs"
          style={{ flex: 1 }}
        />
        <input
          className="add-recipe-form__input"
          type="number"
          min="0"
          max="59"
          value={cookMinutes}
          onChange={e => setCookMinutes(e.target.value === "" ? "" : e.target.value.replace(/^0+(?!$)/, ""))}
          placeholder="Min"
          style={{ flex: 1 }}
        />
      </div>

      <button className="add-recipe-form__button" type="submit">Add Recipe</button>
    </form>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
// client/src/pages/AddRecipe.js
// This page allows users to add new recipes to the backend
