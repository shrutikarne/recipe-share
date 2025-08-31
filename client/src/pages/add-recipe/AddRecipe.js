import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { uploadRecipeImage } from "../../api/uploads";
import RecipePreviewCard from "./RecipePreviewCard";
import { sanitizeString } from "../../utils/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import "./AddRecipe.scss";

/**
 * AddRecipe component
 * Renders a modern form for users to add a new recipe and submits it to the backend API.
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
    imageUrl: "", // Will store the server URL after upload
    imagePreview: "", // For local preview
    imageFile: null, // Stores the actual file object
    diet: "",
  });
  const [ingredientInput, setIngredientInput] = useState("");
  const [stepInput, setStepInput] = useState("");
  const [cookHours, setCookHours] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Step definitions with icons - ensure all required fields are covered
  const steps = [
    {
      title: "Basic Info",
      description: "Add title and description",
      icon: "📝",
      fields: ["title", "description"]
    },
    {
      title: "Ingredients",
      description: "List your ingredients",
      icon: "🥕",
      fields: ["ingredients"]
    },
    {
      title: "Steps",
      description: "Explain how to make it",
      icon: "👨‍🍳",
      fields: ["steps"]
    },
    {
      title: "Details",
      description: "Add final details",
      icon: "🏷️",
      fields: ["category", "diet", "cookHours", "cookMinutes", "imageUrl"]
    }
  ];

  // Enhanced handlers with proper sanitization
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Apply minimal sanitization for all inputs to allow most special characters
    setForm({
      ...form,
      [name]: value
    });
  };

  // Only sanitize on form submission, not during input
  const prepareForSubmission = (formData) => {
    const sanitizedData = {};

    // Make sure required fields are present and not empty
    // According to server validation, title and steps are required
    if (!formData.title || formData.title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!formData.steps || !Array.isArray(formData.steps) || formData.steps.length === 0) {
      throw new Error('At least one step is required');
    }

    if (!formData.ingredients || !Array.isArray(formData.ingredients) || formData.ingredients.length === 0) {
      throw new Error('At least one ingredient is required');
    }

    // Process each field
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        // Only apply minimal sanitization to prevent XSS but preserve most special characters
        sanitizedData[key] = value ? sanitizeString(value) : '';
      } else if (Array.isArray(value)) {
        // Filter out empty items and sanitize each string
        sanitizedData[key] = value
          .filter(item => item && item.trim() !== '')
          .map(item => typeof item === 'string' ? sanitizeString(item) : item);
      } else {
        sanitizedData[key] = value;
      }
    }

    return sanitizedData;
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      // Don't sanitize during input to preserve user's text as-is
      setForm({
        ...form,
        ingredients: [...form.ingredients, ingredientInput.trim()]
      });
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...form.ingredients];
    updatedIngredients.splice(index, 1);
    setForm({ ...form, ingredients: updatedIngredients });
  };

  const handleAddStep = () => {
    if (stepInput.trim()) {
      // Don't sanitize during input to preserve user's text as-is
      setForm({
        ...form,
        steps: [...form.steps, stepInput.trim()]
      });
      setStepInput("");
    }
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = [...form.steps];
    updatedSteps.splice(index, 1);
    setForm({ ...form, steps: updatedSteps });
  };

  // Handle file input for image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Show loading state
        setIsSubmitting(true);

        // For preview purposes, create a local object URL
        const localPreviewUrl = URL.createObjectURL(file);
        setForm({ ...form, imagePreview: localPreviewUrl, imageFile: file });

        // No need to upload immediately, we'll do it on form submission
        setIsSubmitting(false);
      } catch (err) {
        setError('Failed to process image. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  // Step validation
  const validateStep = () => {
    const currentFields = steps[activeStep].fields;
    for (let field of currentFields) {
      if (field === "ingredients" || field === "steps") {
        if (!form[field] || form[field].length === 0) {
          setError(`Please add at least one ${field === "ingredients" ? "ingredient" : "step"}`);
          return false;
        }
      } else if (field === "cookHours" || field === "cookMinutes" || field === "imageUrl" || field === "diet") {
        // These fields are optional
        continue;
      } else if (field === "category" && activeStep === steps.length - 1) {
        // Only validate category on the final step if user is trying to submit
        if (!form[field] || form[field].length < 2) {
          setError("Please select a valid category");
          return false;
        }
      } else if (!form[field] || !form[field].trim()) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields before submission
    if (!form.title || !form.title.trim()) {
      setError("Please enter a recipe title");
      return;
    }

    if (!form.steps || form.steps.length === 0) {
      setError("Please add at least one step");
      return;
    }

    if (!form.ingredients || form.ingredients.length === 0) {
      setError("Please add at least one ingredient");
      return;
    }

    // Validate category (must be at least 2 characters)
    if (!form.category || form.category.trim().length < 2) {
      setError("Please select a valid category");
      return;
    }

    // Calculate cookTime in minutes
    const cookTime =
      (parseInt(cookHours || 0) * 60) + parseInt(cookMinutes || 0);

    // Prevent submission if cookTime is 0
    if (cookTime <= 0) {
      setError("Please set a valid cook time");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // First, handle image upload if we have a new image file
      let finalImageUrl = form.imageUrl; // Start with existing URL if any

      if (form.imageFile) {
        // Upload the image and get its URL
        finalImageUrl = await uploadRecipeImage(form.imageFile);
      }

      // Ensure the image URL is absolute (required by backend)
      // If using S3, the URL will be absolute. No need to prefix with localhost.

      // Apply sanitization to the form data
      const sanitizedForm = prepareForSubmission({
        ...form,
        imageUrl: finalImageUrl // Use the URL from the uploaded image
      });

      // Convert imageUrl to imageUrls array for consistency with schema
      const imageUrls = finalImageUrl ? [finalImageUrl] : [];



      await API.post("/recipes", {
        ...sanitizedForm,
        cookTime,
        imageUrls
      });

      setSuccess("Recipe added!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      if (err.response?.data?.details) {
        // Show specific validation errors if available
        const errorDetails = err.response.data.details;
        const errorMessage = Object.keys(errorDetails)
          .map(key => `${key}: ${errorDetails[key]}`)
          .join(", ");
        setError(`Validation error: ${errorMessage}`);
      } else {
        setError(err.response?.data?.msg || "Error adding recipe");
      }
      setIsSubmitting(false);
    }
  };

  // Step content rendering with improved UX
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <label className="add-recipe-form__label" htmlFor="title">Recipe Title</label>
            <input
              className="add-recipe-form__input"
              id="title"
              name="title"
              placeholder="E.g., Homemade Margherita Pizza"
              value={form.title}
              onChange={handleChange}
              aria-required="true"
            />

            <label className="add-recipe-form__label" htmlFor="description">Description</label>
            <textarea
              className="add-recipe-form__textarea"
              id="description"
              name="description"
              placeholder="Describe your recipe in a few sentences..."
              value={form.description}
              onChange={handleChange}
              aria-required="true"
              rows={4}
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <label className="add-recipe-form__label">Ingredients</label>

            <div className="item-list">
              {form.ingredients.map((ingredient, index) => (
                <div key={index} className="item-list__item">
                  <div className="item-list__item-content">{ingredient}</div>
                  <button
                    type="button"
                    className="item-list__item-remove"
                    onClick={() => handleRemoveIngredient(index)}
                    aria-label={`Remove ingredient: ${ingredient}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="add-recipe-form__input"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleAddIngredient()}
                placeholder="Type an ingredient and press Enter"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="form-btn form-btn--primary"
                style={{ padding: "0 16px" }}
              >
                Add
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <label className="add-recipe-form__label">Preparation Steps</label>

            <div className="item-list">
              {form.steps.map((step, index) => (
                <div key={index} className="item-list__item">
                  <div className="item-list__item-number">{index + 1}</div>
                  <div className="item-list__item-content">{step}</div>
                  <button
                    type="button"
                    className="item-list__item-remove"
                    onClick={() => handleRemoveStep(index)}
                    aria-label={`Remove step ${index + 1}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                className="add-recipe-form__textarea"
                value={stepInput}
                onChange={e => setStepInput(e.target.value)}
                placeholder="Describe a step in the cooking process..."
                style={{ flex: 1 }}
                rows={2}
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="form-btn form-btn--primary"
                style={{ padding: "0 16px", alignSelf: "flex-start" }}
              >
                Add
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="add-recipe-form__file-input-container">
              <input
                ref={fileInputRef}
                type="file"
                className="add-recipe-form__file-input"
                id="recipe-image"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <label htmlFor="recipe-image" className="add-recipe-form__file-label">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 16V17C7 19.7614 9.23858 22 12 22C14.7614 22 17 19.7614 17 17V16M12 2V12M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{form.imagePreview || form.imageUrl ? "Change Image" : "Upload Recipe Image"}</span>
              </label>
            </div>

            <div className="add-recipe-form__grid">
              <div>
                <label className="add-recipe-form__label" htmlFor="category">Category <span style={{ color: '#666', fontSize: '0.85em' }}>(required)</span></label>
                <select
                  className={`add-recipe-form__select ${!form.category ? 'add-recipe-form__select--required' : ''}`}
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
                {!form.category && (
                  <div style={{ color: '#ef4444', fontSize: '0.85em', marginTop: -12, marginBottom: 12 }}>
                    Please select a category
                  </div>
                )}
              </div>

              <div>
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
              </div>
            </div>

            <label className="add-recipe-form__label">Cook Time <span style={{ color: '#666', fontSize: '0.85em' }}>(required, at least 1 minute)</span></label>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <input
                  className="add-recipe-form__input"
                  type="number"
                  min="0"
                  value={cookHours}
                  onChange={e => setCookHours(e.target.value)}
                  placeholder="Hours"
                  id="cook-hours"
                  aria-label="Cook time hours"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  className="add-recipe-form__input"
                  type="number"
                  min="0"
                  max="59"
                  value={cookMinutes}
                  onChange={e => {
                    // Ensure minutes are between 0-59
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 59) {
                      setCookMinutes(val);
                    } else if (e.target.value === '') {
                      setCookMinutes('');
                    }
                  }}
                  placeholder="Minutes"
                  id="cook-minutes"
                  aria-label="Cook time minutes"
                />
              </div>
            </div>
            {(cookHours === '0' || cookHours === 0 || cookHours === '') &&
              (cookMinutes === '0' || cookMinutes === 0 || cookMinutes === '') && (
                <div style={{ color: '#ef4444', fontSize: '0.85em', marginTop: -16, marginBottom: 16 }}>
                  Please set cook time to at least 1 minute
                </div>
              )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="add-recipe-form-preview-layout">
      <motion.form
        className="add-recipe-form"
        onSubmit={handleSubmit}
        aria-label="Add recipe form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="add-recipe-form__h2">Create Your Recipe</h2>

        <div className="stepper">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`stepper__step ${idx === activeStep ? "active" : ""} ${idx < activeStep ? "completed" : ""}`}
            >
              <div className="stepper__step-number">
                {idx < activeStep ? "✓" : idx + 1}
              </div>
              <div className="stepper__step-text">
                <div className="stepper__step-title">{step.title}</div>
                <div className="stepper__step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="form-error"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="form-success"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="form-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent(activeStep)}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="form-navigation">
          <div className="form-navigation__buttons">
            {activeStep > 0 && (
              <motion.button
                type="button"
                onClick={handleBack}
                className="form-btn form-btn--secondary"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                Back
              </motion.button>
            )}

            {activeStep === steps.length - 1 ? (
              <motion.button
                type="submit"
                className="form-btn form-btn--primary"
                disabled={isSubmitting || !!error || !form.category || ((cookHours === '0' || cookHours === 0 || cookHours === '') &&
                  (cookMinutes === '0' || cookMinutes === 0 || cookMinutes === ''))}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? "Submitting..." : "Submit Recipe"}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleNext}
                className="form-btn form-btn--primary"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                Continue
              </motion.button>
            )}
          </div>

          <div className="form-navigation__progress">Step {activeStep + 1} of {steps.length}</div>
        </div>
      </motion.form>

      <RecipePreviewCard form={form} cookHours={cookHours} cookMinutes={cookMinutes} />
    </div>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
