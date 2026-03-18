import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";

import RecipePreviewCard from "./RecipePreviewCard";
import { sanitizeString } from "../../utils/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import "./AddRecipe.scss";
import { AddCircleIcon, DeleteIcon } from "../../components/SvgIcons";

const MAX_IMAGE_COUNT = 10;
const minutesToTimeParts = (value) => {
  if (!Number.isFinite(value) || value <= 0) {
    return { hours: "", minutes: "" };
  }
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: minutes > 0 ? String(minutes) : ""
  };
};

/**
 * @typedef {Object} RecipeFormState
 * @property {string} title
 * @property {string} description
 * @property {string[]} ingredients
 * @property {string[]} steps
 * @property {string} category
 * @property {string} diet
 */

/**
 * AddRecipe component provides a multi-step form for admins to create, edit, and submit recipes.
 * It includes client-side validation, Cloudinary-backed image handling, and a live preview.
 *
 * @returns {JSX.Element} Add-recipe workflow layout.
 */
function AddRecipe() {
  const navigate = useNavigate();
  const { id: editRecipeId } = useParams();
  const isEditMode = Boolean(editRecipeId);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("adminToken") !== null);

  useEffect(() => {
    const handleAdminChange = () => {
      const authed = localStorage.getItem("adminToken") !== null;
      setIsAdmin(authed);
      if (!authed) {
        navigate("/admin");
      }
    };

    handleAdminChange();
    window.addEventListener("admin-auth-changed", handleAdminChange);
    return () => window.removeEventListener("admin-auth-changed", handleAdminChange);
  }, [navigate]);

  const [activeStep, setActiveStep] = useState(0);
  const [prefillLoading, setPrefillLoading] = useState(isEditMode);
  /**
   * @type {[RecipeFormState, React.Dispatch<React.SetStateAction<RecipeFormState>>]}
   */
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: [],
    steps: [],
    category: "",
    diet: "",
  });
  const [images, setImages] = useState([]);
  const imagesRef = useRef(images);
  const fileInputRef = useRef(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [stepInput, setStepInput] = useState("");
  const [cookHours, setCookHours] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [prepHours, setPrepHours] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      // Cleanup blob URLs if any exist
      imagesRef.current.forEach((image) => {
        if (image?.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!isEditMode || !editRecipeId) {
      setPrefillLoading(false);
      return;
    }

    let isActive = true;
    const loadRecipe = async () => {
      setPrefillLoading(true);
      try {
        const { data } = await API.get(`/recipes/${editRecipeId}`);
        if (!isActive || !data) return;

        setForm({
          title: data.title || "",
          description: data.description || "",
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
          steps: Array.isArray(data.steps) ? data.steps : [],
          category: data.category || "",
          diet: data.diet || ""
        });

        const cookParts = minutesToTimeParts(Number(data.cookTime));
        const prepParts = minutesToTimeParts(Number(data.prepTime));
        setCookHours(cookParts.hours);
        setCookMinutes(cookParts.minutes);
        setPrepHours(prepParts.hours);
        setPrepMinutes(prepParts.minutes);

        const urls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
        const fallback = data.imageUrl ? [data.imageUrl] : [];
        const normalized = (urls.length ? urls : fallback)
          .filter((url) => typeof url === "string" && url.trim().length > 0)
          .map((url) => ({ url }));
        setImages(normalized);
        setError("");
      } catch (err) {
        if (!isActive) return;
        setError("Unable to load recipe for editing. Please try again.");
      } finally {
        if (isActive) {
          setPrefillLoading(false);
        }
      }
    };

    loadRecipe();
    return () => {
      isActive = false;
    };
  }, [editRecipeId, isEditMode]);

  const cookTimeMinutes = useMemo(() => {
    const hours = Number(cookHours) || 0;
    const minutes = Number(cookMinutes) || 0;
    return hours * 60 + minutes;
  }, [cookHours, cookMinutes]);
  const prepTimeMinutes = useMemo(() => {
    const hours = Number(prepHours) || 0;
    const minutes = Number(prepMinutes) || 0;
    return hours * 60 + minutes;
  }, [prepHours, prepMinutes]);
  const isCookTimeValid = cookTimeMinutes > 0;
  const isCategoryValid = form.category.trim().length >= 2;

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
      fields: ["category"]
    }
  ];

  /**
   * Handle text/select changes by updating the form state.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Prepare sanitized payload for submission without mutating the original form state.
   * @param {RecipeFormState} formData
   * @returns {RecipeFormState}
   */
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

  /**
   * Append a trimmed ingredient entry to the form state.
   * @returns {void}
   */
  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;

    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, trimmed]
    }));
    setIngredientInput("");
  };

  /**
   * Remove ingredient at a given index.
   * @param {number} index
   */
  const handleRemoveIngredient = (index) => {
    setForm((prev) => {
      const updatedIngredients = prev.ingredients.filter((_, idx) => idx !== index);
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  /**
   * Append a trimmed preparation step to the form state.
   * @returns {void}
   */
  const handleAddStep = () => {
    const trimmed = stepInput.trim();
    if (!trimmed) return;

    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, trimmed]
    }));
    setStepInput("");
  };

  /**
   * Remove a step by index.
   * @param {number} index
   */
  const handleRemoveStep = (index) => {
    setForm((prev) => {
      const updatedSteps = prev.steps.filter((_, idx) => idx !== index);
      return { ...prev, steps: updatedSteps };
    });
  };

  /**
   * Remove an uploaded/pasted image by index and clean up blob URLs.
   * @param {number} index
   */
  const handleRemoveImage = (index) => {
    const limitMessage = `You can upload up to ${MAX_IMAGE_COUNT} images.`;
    setImages((prev) => {
      if (index < 0 || index >= prev.length) return prev;

      const image = prev[index];
      if (image?.url && image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }

      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (error === limitMessage) {
      setError("");
    }
    setUploadError("");
  };

  /**
   * Upload an image file to the backend (Cloudinary) and append its URL to the form state.
   * @param {React.ChangeEvent<HTMLInputElement>} event
   * @returns {Promise<void>}
   */
  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (images.length >= MAX_IMAGE_COUNT) {
      setError(`Only ${MAX_IMAGE_COUNT} images are allowed.`);
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await API.post("/uploads/image", formData);
      setImages((prev) => [...prev, { url: data.url, publicId: data.publicId }]);
    } catch (uploadErr) {
      if (uploadErr.response?.status === 401) {
        setUploadError("Session expired. Please log in again.");
        localStorage.removeItem("adminToken");
        window.dispatchEvent(new Event("admin-auth-changed"));
        navigate("/admin");
      } else {
        const message = uploadErr.response?.data?.msg || "Failed to upload image";
        setUploadError(message);
      }
    } finally {
      setIsUploadingImage(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  /**
   * Generates a cropped square canvas based on the saved adjustments.
   * @param {Object} imageItem - Target image descriptor from local state.
   * @param {{zoom:number, offsetX:number, offsetY:number}} adjustments - Applied transform values.
   * @returns {Promise<{file: File, previewUrl: string}>}
   */
  const validateStep = () => {
    const currentFields = steps[activeStep].fields;
    for (const field of currentFields) {
      const value = form[field];

      if (Array.isArray(value)) {
        if (!value.length) {
          setError(`Please add at least one ${field === "ingredients" ? "ingredient" : "step"}`);
          return false;
        }
        continue;
      }

      if (field === "category") {
        if (!isCategoryValid) {
          setError("Please select a valid category");
          return false;
        }
        continue;
      }

      if (!value || !value.trim()) {
        setError(`Please fill in the ${field} field`);
        return false;
      }
    }
    setError("");
    return true;
  };

  /**
   * Proceed to the next step when validation passes.
   * @returns {void}
   */
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * Return to the previous step and clear errors.
   * @returns {void}
   */
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Submit the recipe to the backend once all validations succeed.
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {Promise<void>}
   */
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
    if (!isCategoryValid) {
      setError("Please select a valid category");
      return;
    }

    // Prevent submission if cookTime is 0
    if (!isCookTimeValid) {
      setError("Please set a valid cook time");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // For personal recipe sharing, only accept image URLs (no local file uploads)
      const imageUrls = images
        .filter((img) => typeof img.url === 'string' && img.url.trim().length > 0)
        .map((img) => img.url);

      const sanitizedForm = prepareForSubmission(form);

      const payload = {
        ...sanitizedForm,
        cookTime: cookTimeMinutes,
        prepTime: prepTimeMinutes,
        imageUrls,
        imageUrl: imageUrls[0] || ""
      };

      if (isEditMode && editRecipeId) {
        await API.put(`/recipes/${editRecipeId}`, payload);
      } else {
        await API.post("/recipes", payload);
      }

      setSuccess(isEditMode ? "Recipe updated!" : "Recipe added!");
      setTimeout(() => navigate(isEditMode ? "/admin" : "/"), 1200);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render the inputs for the requested step index.
   * @param {number} step
   * @returns {JSX.Element|null}
   */
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
                    <DeleteIcon className="item-list__item-remove-icon" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                className="add-recipe-form__input"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
                placeholder="Type an ingredient and press Enter"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="item-list__item-add"
                aria-label="Add ingredient"
              >
                <AddCircleIcon className="item-list__item-add-icon" aria-hidden="true" />
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
                    <DeleteIcon className="item-list__item-remove-icon" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                className="item-list__item-add"
                aria-label="Add preparation step"
              >
                <AddCircleIcon className="item-list__item-add-icon" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        );

      case 3: {
        const selectedImageCount = images.length;
        const hasImages = selectedImageCount > 0;
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p style={{ marginBottom: 16 }}>
              Image uploads are optional. Each file is stored on Cloudinary’s free tier and immediately attached to this recipe.
            </p>
            <div className="add-recipe-form__upload">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageFileChange}
              />
              <button
                type="button"
                className="add-recipe-form__upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || images.length >= MAX_IMAGE_COUNT}
              >
                {isUploadingImage ? "Uploading..." : "Upload Image"}
              </button>
              <span className="add-recipe-form__upload-hint">
                {selectedImageCount}/{MAX_IMAGE_COUNT} images
              </span>
            </div>
            {uploadError && (
              <div className="add-recipe-form__upload-error" role="alert">
                {uploadError}
              </div>
            )}

            {hasImages && (
              <div className="add-recipe-form__image-preview-grid">
                {images.map((image, idx) => (
                  <div key={image.id ?? `${image.url}-${idx}`} className="add-recipe-form__image-preview-item">
                    <img src={image.url} alt={`Recipe preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="add-recipe-form__image-remove"
                      onClick={() => handleRemoveImage(idx)}
                      aria-label={`Remove recipe image ${idx + 1}`}
                    >
                      <DeleteIcon aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

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
                {!isCategoryValid && (
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

            <label className="add-recipe-form__label">Prep Time <span style={{ color: '#666', fontSize: '0.85em' }}>(optional)</span></label>
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <input
                  className="add-recipe-form__input"
                  type="number"
                  min="0"
                  value={prepHours}
                  onChange={e => setPrepHours(e.target.value)}
                  placeholder="Hours"
                  id="prep-hours"
                  aria-label="Prep time hours"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  className="add-recipe-form__input"
                  type="number"
                  min="0"
                  max="59"
                  value={prepMinutes}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val >= 0 && val <= 59) {
                      setPrepMinutes(val);
                    } else if (e.target.value === '') {
                      setPrepMinutes('');
                    }
                  }}
                  placeholder="Minutes"
                  id="prep-minutes"
                  aria-label="Prep time minutes"
                />
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
            {!isCookTimeValid && (
                <div style={{ color: '#ef4444', fontSize: '0.85em', marginTop: -16, marginBottom: 16 }}>
                  Please set cook time to at least 1 minute
                </div>
              )}
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="admin-panel-content">
          <h1>Admin Access Required</h1>
          <p>Please log in on the Admin page to manage recipes.</p>
        </div>
      </div>
    );
  }

  if (isEditMode && prefillLoading) {
    return (
      <div className="add-recipe-form__loading">
        <p>Loading recipe details...</p>
      </div>
    );
  }

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
        <h2 className="add-recipe-form__h2">{isEditMode ? "Update Recipe" : "Create Your Recipe"}</h2>

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
                disabled={isSubmitting || !!error || !isCategoryValid || !isCookTimeValid}
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

      <RecipePreviewCard
        form={form}
        cookHours={cookHours}
        cookMinutes={cookMinutes}
        prepHours={prepHours}
        prepMinutes={prepMinutes}
        images={images}
      />


    </div>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
