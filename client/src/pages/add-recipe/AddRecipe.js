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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    const cookTime =
      (parseInt(cookHours) || 0) * 3600 + (parseInt(cookMinutes) || 0);
    setError("");
    setSuccess("");
    try {
      await API.post("/recipes", { ...form, cookTime });
      setSuccess("Recipe added!");
      setTimeout(() => navigate("/"), 1200); // Redirect after short delay
    } catch (err) {
      setError(err.response?.data?.msg || "Error adding recipe");
    }
  };

  // --- Render logic (in order of user flow) ---
  return (
    <form
      className="add-recipe-form"
      onSubmit={handleSubmit}
      aria-label="Add recipe form"
    >
      <h2 className="add-recipe-form__h2">Add Recipe</h2>
      {error && (
        <div
          className="form-error"
          role="alert"
          style={{ color: "red", marginBottom: 8 }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="form-success"
          role="alert"
          style={{ color: "green", marginBottom: 8 }}
        >
          {success}
        </div>
      )}
      <label className="add-recipe-form__label visually-hidden" htmlFor="title">
        Title
      </label>
      <input
        className="add-recipe-form__input"
        id="title"
        name="title"
        placeholder="Title"
        onChange={handleChange}
        aria-required="true"
      />

      <label
        className="add-recipe-form__label visually-hidden"
        htmlFor="description"
      >
        Description
      </label>
      <input
        className="add-recipe-form__input"
        id="description"
        name="description"
        placeholder="Description"
        onChange={handleChange}
        aria-required="true"
      />

      <label
        className="add-recipe-form__label visually-hidden"
        htmlFor="category"
      >
        Category
      </label>
      <select
        className="add-recipe-form__select"
        id="category"
        name="category"
        value={form.category}
        onChange={handleChange}
        aria-required="true"
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

      <label className="add-recipe-form__label visually-hidden" htmlFor="diet">
        Diet Type
      </label>
      <select
        className="add-recipe-form__select"
        id="diet"
        name="diet"
        value={form.diet}
        onChange={handleChange}
        aria-required="true"
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

      <label
        className="add-recipe-form__label visually-hidden"
        htmlFor="imageUrl"
      >
        Add Image
      </label>
      <input
        className="add-recipe-form__input"
        id="imageUrl"
        name="imageUrl"
        placeholder="JPG/PNG, 800x450px"
        onChange={handleChange}
        aria-required="false"
      />

      <label
        className="add-recipe-form__label visually-hidden"
        htmlFor="ingredients"
      >
        Ingredients (comma separated)
      </label>
      <input
        className="add-recipe-form__input"
        id="ingredients"
        name="ingredients"
        placeholder="e.g. flour, sugar, eggs"
        onChange={handleIngredientsChange}
        aria-required="true"
      />

      <label className="add-recipe-form__label visually-hidden" htmlFor="steps">
        Steps (comma separated)
      </label>
      <input
        className="add-recipe-form__input"
        id="steps"
        name="steps"
        placeholder="e.g. mix, bake, serve"
        onChange={handleStepsChange}
        aria-required="true"
      />

      <label
        className="add-recipe-form__label visually-hidden"
        htmlFor="cook-hours"
      >
        Cook Time Hours
      </label>
      <label
        className="add-recipe-form__label visually-hidden"
        htmlFor="cook-minutes"
      >
        Cook Time Minutes
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="add-recipe-form__input"
          type="number"
          min="0"
          value={cookHours}
          onChange={(e) =>
            setCookHours(
              e.target.value === ""
                ? ""
                : e.target.value.replace(/^0+(?!$)/, "")
            )
          }
          placeholder="Hrs"
          style={{ flex: 1 }}
          id="cook-hours"
          aria-label="Cook time hours"
        />
        <input
          className="add-recipe-form__input"
          type="number"
          min="0"
          max="59"
          value={cookMinutes}
          onChange={(e) =>
            setCookMinutes(
              e.target.value === ""
                ? ""
                : e.target.value.replace(/^0+(?!$)/, "")
            )
          }
          placeholder="Min"
          style={{ flex: 1 }}
          id="cook-minutes"
          aria-label="Cook time minutes"
        />
      </div>

      <button
        className="add-recipe-form__button"
        type="submit"
        aria-label="Add recipe"
      >
        Add Recipe
      </button>
    </form>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
// client/src/pages/AddRecipe.js
// This page allows users to add new recipes to the backend
