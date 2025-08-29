import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import RecipePreviewCard from "./RecipePreviewCard";
import { sanitizeString, sanitizeFormData } from "../../utils/sanitize";
import "./AddRecipe.scss";

/**
 * AddRecipe component
 * Renders a form for users to add a new recipe and submits it to the backend API.
 * @component
 */
function AddRecipe() {
  // --- Stepper State ---
  const [activeStep, setActiveStep] = useState(0);
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
  const navigate = useNavigate();

  // Step definitions
  const steps = [
    {
      title: "Basic Info",
      description: "Add title and description",
      fields: ["title", "description"]
    },
    {
      title: "Ingredients",
      description: "List your ingredients",
      fields: ["ingredients"]
    },
    {
      title: "Steps",
      description: "Explain how to make it",
      fields: ["steps"]
    },
    {
      title: "Details",
      description: "Add final details",
      fields: ["category", "diet", "cookHours", "cookMinutes", "imageUrl"]
    }
  ];

  // Handlers with sanitization
  const handleChange = (e) => setForm({ ...form, [e.target.name]: sanitizeString(e.target.value) });
  const handleIngredientsChange = (e) => {
    const sanitizedValue = sanitizeString(e.target.value);
    setForm({ ...form, ingredients: sanitizedValue.split(",").map(item => sanitizeString(item.trim())) });
  };
  const handleStepsChange = (e) => {
    const sanitizedValue = sanitizeString(e.target.value);
    setForm({ ...form, steps: sanitizedValue.split(",").map(item => sanitizeString(item.trim())) });
  };

  // Step validation
  const validateStep = () => {
    const currentFields = steps[activeStep].fields;
    for (let field of currentFields) {
      if (field === "ingredients" || field === "steps") {
        if (!form[field] || form[field].length === 0 || form[field].every(item => !item.trim())) {
          setError(`Please fill in the ${field} field`);
          return false;
        }
      } else if (field === "cookHours" || field === "cookMinutes") {
        // Optional
        continue;
      } else if (!form[field] || !form[field].trim()) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert hours and minutes to minutes for the backend
    const cookTime = (parseInt(cookHours) || 0) * 60 + (parseInt(cookMinutes) || 0);
    setError("");
    setSuccess("");
    try {
      // Convert imageUrl to imageUrls array for consistency with schema
      const imageUrls = form.imageUrl ? [sanitizeString(form.imageUrl)] : [];

      // Sanitize all form data before submission
      const sanitizedForm = sanitizeFormData(form);

      await API.post("/recipes", {
        ...sanitizedForm,
        cookTime,
        imageUrls
      });
      setSuccess("Recipe added!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(err.response?.data?.msg || "Error adding recipe");
    }
  };

  // Step content rendering
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <label className="add-recipe-form__label" htmlFor="title">Title</label>
            <input className="add-recipe-form__input" id="title" name="title" placeholder="Title" value={form.title} onChange={handleChange} aria-required="true" />
            <label className="add-recipe-form__label" htmlFor="description">Description</label>
            <input className="add-recipe-form__input" id="description" name="description" placeholder="Description" value={form.description} onChange={handleChange} aria-required="true" />
          </>
        );
      case 1:
        return (
          <>
            <label className="add-recipe-form__label" htmlFor="ingredients">Ingredients (comma separated)</label>
            <input className="add-recipe-form__input" id="ingredients" name="ingredients" placeholder="e.g. flour, sugar, eggs" value={form.ingredients.join(",")} onChange={handleIngredientsChange} aria-required="true" />
          </>
        );
      case 2:
        return (
          <>
            <label className="add-recipe-form__label" htmlFor="steps">Steps (comma separated)</label>
            <input className="add-recipe-form__input" id="steps" name="steps" placeholder="e.g. mix, bake, serve" value={form.steps.join(",")} onChange={handleStepsChange} aria-required="true" />
          </>
        );
      case 3:
        return (
          <>
            <label className="add-recipe-form__label" htmlFor="category">Category</label>
            <select className="add-recipe-form__select" id="category" name="category" value={form.category} onChange={handleChange} aria-required="true">
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
            <select className="add-recipe-form__select" id="diet" name="diet" value={form.diet} onChange={handleChange} aria-required="true">
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
            <input className="add-recipe-form__input" id="imageUrl" name="imageUrl" placeholder="JPG/PNG, 800x450px" value={form.imageUrl} onChange={handleChange} aria-required="false" />
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input className="add-recipe-form__input" type="number" min="0" value={cookHours} onChange={e => setCookHours(e.target.value)} placeholder="Hrs" style={{ flex: 1 }} id="cook-hours" aria-label="Cook time hours" />
              <input className="add-recipe-form__input" type="number" min="0" max="59" value={cookMinutes} onChange={e => setCookMinutes(e.target.value)} placeholder="Min" style={{ flex: 1 }} id="cook-minutes" aria-label="Cook time minutes" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="add-recipe-form-preview-layout">
      <form className="add-recipe-form" onSubmit={handleSubmit} aria-label="Add recipe form">
        <h2 className="add-recipe-form__h2">Add Recipe</h2>
        <div className="stepper">
          {steps.map((step, idx) => (
            <div key={step.title} className={`stepper__step ${idx === activeStep ? "active" : ""} ${idx < activeStep ? "completed" : ""}`}>
              <div className="stepper__step-number">{idx + 1}</div>
              <div className="stepper__step-text">
                <div className="stepper__step-title">{step.title}</div>
                <div className="stepper__step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        {success && <div className="form-success" role="alert">{success}</div>}
        <div className="form-content">{renderStepContent(activeStep)}</div>
        <div className="form-navigation">
          <div className="form-navigation__buttons">
            {activeStep > 0 && (
              <button type="button" onClick={handleBack} className="form-btn form-btn--secondary">Back</button>
            )}
            {activeStep === steps.length - 1 ? (
              <button type="submit" className="form-btn form-btn--primary" disabled={!!error}>Submit Recipe</button>
            ) : (
              <button type="button" onClick={handleNext} className="form-btn form-btn--primary">Continue</button>
            )}
          </div>
          <div className="form-navigation__progress">Step {activeStep + 1} of {steps.length}</div>
        </div>
      </form>
      <RecipePreviewCard form={form} cookHours={cookHours} cookMinutes={cookMinutes} />
    </div>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
// client/src/pages/AddRecipe.js
// This page allows users to add new recipes to the backend
