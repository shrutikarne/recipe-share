import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { uploadRecipeImage } from "../../api/uploads";
import RecipePreviewCard from "./RecipePreviewCard";
import ImageAdjustModal from "./ImageAdjustModal";
import { sanitizeString } from "../../utils/sanitize";
import { motion, AnimatePresence } from "framer-motion";
import "./AddRecipe.scss";
import { AddCircleIcon, DeleteIcon } from "../../components/SvgIcons";
import { ReactComponent as UploadIcon } from "../../assets/icons/upload_recipe.svg";
import { ReactComponent as EditImageIcon } from "../../assets/icons/edit_image.svg";
import resolveImageUrl from "../../utils/resolveImageUrl";

const MAX_IMAGE_COUNT = 10;

/**
 * AddRecipe component
 * Renders a modern form for users to add a new recipe and submits it to the backend API.
 * @component
 */
function AddRecipe() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: [],
    steps: [],
    category: "",
    diet: "",
  });
  const [images, setImages] = useState([]);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const imagesRef = useRef(images);
  const [ingredientInput, setIngredientInput] = useState("");
  const [stepInput, setStepInput] = useState("");
  const [cookHours, setCookHours] = useState("");
  const [cookMinutes, setCookMinutes] = useState("");
  const [prepHours, setPrepHours] = useState("");
  const [prepMinutes, setPrepMinutes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image?.type === 'local') {
          if (image.url && image.url.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
          }
          if (image.originalUrl && image.originalUrl.startsWith('blob:')) {
            URL.revokeObjectURL(image.originalUrl);
          }
        }
      });
    };
  }, []);

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

  // Enhanced handlers with proper sanitization
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
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
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;

    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, trimmed]
    }));
    setIngredientInput("");
  };

  const handleRemoveIngredient = (index) => {
    setForm((prev) => {
      const updatedIngredients = prev.ingredients.filter((_, idx) => idx !== index);
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  const handleAddStep = () => {
    const trimmed = stepInput.trim();
    if (!trimmed) return;

    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, trimmed]
    }));
    setStepInput("");
  };

  const handleRemoveStep = (index) => {
    setForm((prev) => {
      const updatedSteps = prev.steps.filter((_, idx) => idx !== index);
      return { ...prev, steps: updatedSteps };
    });
  };

  /**
   * Creates the local image state entry used for previews and adjustments.
   * @param {File} file - Raw image file from the input element.
   * @returns {Promise<Object>} Promise resolving to the structured image item.
   */
  const createImageItem = (file) => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'local',
        url: objectUrl,
        originalUrl: objectUrl,
        file,
        originalFile: file,
        adjustments: {
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image.'));
    };

    img.src = objectUrl;
  });

  // Handle file input for images (up to MAX_IMAGE_COUNT)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const limitMessage = `You can upload up to ${MAX_IMAGE_COUNT} images.`;
    const currentCount = images.length;
    const remainingSlots = Math.max(0, MAX_IMAGE_COUNT - currentCount);

    if (!remainingSlots) {
      setError((prev) => prev || limitMessage);
      e.target.value = "";
      return;
    }

    try {
      const selectedFiles = files.slice(0, remainingSlots);
      const imageItems = await Promise.all(selectedFiles.map((file) => createImageItem(file)));

      setImages((prev) => [...prev, ...imageItems]);

      if (files.length > selectedFiles.length) {
        setError((prev) => prev || limitMessage);
      } else if (error === limitMessage) {
        setError("");
      }
    } catch (err) {
      setError('Failed to process images. Please try again.');
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    const limitMessage = `You can upload up to ${MAX_IMAGE_COUNT} images.`;
    setImages((prev) => {
      if (index < 0 || index >= prev.length) return prev;

      const image = prev[index];
      if (image?.type === 'local') {
        if (image.url && image.url.startsWith('blob:') && image.url !== image.originalUrl) {
          URL.revokeObjectURL(image.url);
        }
        if (image.originalUrl && image.originalUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.originalUrl);
        }
      }

      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (error === limitMessage) {
      setError("");
    }

    if (editingImageIndex !== null) {
      setEditingImageIndex(null);
    }
  };

  /**
   * Generates a cropped square canvas based on the saved adjustments.
   * @param {Object} imageItem - Target image descriptor from local state.
   * @param {{zoom:number, offsetX:number, offsetY:number}} adjustments - Applied transform values.
   * @returns {Promise<{file: File, previewUrl: string}>}
   */
  const cropImageWithAdjustments = (imageItem, adjustments) => new Promise((resolve, reject) => {
    if (!imageItem?.originalUrl || !imageItem?.originalFile) {
      reject(new Error('Missing image data.'));
      return;
    }

    const { naturalWidth, naturalHeight } = imageItem.adjustments || {};
    if (!naturalWidth || !naturalHeight) {
      reject(new Error('Image dimensions unavailable.'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      const minDimension = Math.min(naturalWidth, naturalHeight);
      const zoom = Math.max(1, adjustments.zoom || 1);
      const visibleSize = minDimension / zoom;
      const maxOffsetX = (naturalWidth - visibleSize) / 2;
      const maxOffsetY = (naturalHeight - visibleSize) / 2;

      const normalizedOffsetX = Math.max(-1, Math.min(1, adjustments.offsetX || 0));
      const normalizedOffsetY = Math.max(-1, Math.min(1, adjustments.offsetY || 0));

      const centerX = naturalWidth / 2 + normalizedOffsetX * maxOffsetX;
      const centerY = naturalHeight / 2 + normalizedOffsetY * maxOffsetY;

      const cropX = centerX - visibleSize / 2;
      const cropY = centerY - visibleSize / 2;

      const outputSize = Math.min(visibleSize, 1080);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(outputSize);
      canvas.height = Math.round(outputSize);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported.'));
        return;
      }

      ctx.drawImage(
        img,
        cropX,
        cropY,
        visibleSize,
        visibleSize,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob.'));
          return;
        }

        const fileName = imageItem.originalFile?.name || `recipe-image-${Date.now()}.jpg`;
        const fileType = imageItem.originalFile?.type || 'image/jpeg';
        const croppedFile = new File([blob], fileName, { type: fileType });
        const previewUrl = URL.createObjectURL(blob);
        resolve({ file: croppedFile, previewUrl });
      }, imageItem.originalFile?.type || 'image/jpeg', 0.92);
    };

    img.onerror = () => {
      reject(new Error('Failed to process image.'));
    };

    if (!imageItem.originalUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.src = imageItem.originalUrl;
  });

  /**
   * Persists the crop adjustments for a queued upload and refreshes the preview.
   * @param {number} index - Index of the image within the local array.
   * @param {{zoom:number, offsetX:number, offsetY:number}} adjustments - Updated crop data from the modal.
   * @returns {Promise<void>}
   */
  const handleAdjustSave = async (index, adjustments) => {
    if (index === null || index === undefined) return;
    const targetImage = images[index];
    if (!targetImage || targetImage.type !== 'local') {
      setEditingImageIndex(null);
      return;
    }

    try {
      setIsProcessingImage(true);
      const result = await cropImageWithAdjustments(targetImage, adjustments);

      setImages((prev) => {
        const next = [...prev];
        const existing = next[index];
        if (!existing) {
          return prev;
        }

        next[index] = {
          ...existing,
          url: result.previewUrl,
          file: result.file,
          adjustments: {
            ...existing.adjustments,
            zoom: Math.max(1, adjustments.zoom || 1),
            offsetX: Math.max(-1, Math.min(1, adjustments.offsetX || 0)),
            offsetY: Math.max(-1, Math.min(1, adjustments.offsetY || 0))
          }
        };

        return next;
      });
      setError("");
    } catch (err) {
      setError(err.message || 'Failed to adjust image. Please try again.');
    } finally {
      setIsProcessingImage(false);
      setEditingImageIndex(null);
    }
  };

  // Step validation
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
      const existingImageUrls = images
        .filter((img) => img.type === 'remote' && (typeof img.url === 'string' || typeof img.remoteUrl === 'string'))
        .map((img) => img.remoteUrl || img.url);

      const localImages = images.filter((img) => img.type === 'local');

      const uploadedImageResults = [];

      for (const image of localImages) {
        if (!image.file) continue;
        const uploadResult = await uploadRecipeImage(image.file);
        if (uploadResult && uploadResult.imageUrl) {
          uploadedImageResults.push(uploadResult);
        }
      }

      const imageUrls = [...existingImageUrls, ...uploadedImageResults.map((item) => item.imageUrl)];

      if (uploadedImageResults.length) {
        const urlsToRevoke = [];
        setImages((prev) => {
          const next = [];
          let uploadedIndex = 0;
          for (const item of prev) {
            if (item.type === 'local') {
              const uploadedMeta = uploadedImageResults[uploadedIndex];
              uploadedIndex += 1;
              if (uploadedMeta && uploadedMeta.imageUrl) {
                if (item.originalUrl && item.originalUrl.startsWith('blob:')) {
                  urlsToRevoke.push(item.originalUrl);
                }
                if (item.url && item.url.startsWith('blob:')) {
                  urlsToRevoke.push(item.url);
                }

                next.push({
                  ...item,
                  type: 'remote',
                  url: resolveImageUrl(uploadedMeta.imageUrl) || uploadedMeta.imageUrl,
                  remoteUrl: uploadedMeta.imageUrl,
                  imageKey: uploadedMeta.imageKey,
                  originalUrl: uploadedMeta.imageUrl,
                  originalFile: undefined,
                  file: undefined
                });
              } else {
                next.push(item);
              }
            } else {
              next.push(item);
            }
          }
          return next;
        });

        if (urlsToRevoke.length) {
          const revoke = () => {
            urlsToRevoke.forEach((url) => {
              try {
                URL.revokeObjectURL(url);
              } catch (revokeError) {
                console.warn('Failed to revoke object URL', revokeError);
              }
            });
          };

          if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(revoke);
          } else {
            setTimeout(revoke, 0);
          }
        }
      }

      const sanitizedForm = prepareForSubmission(form);

      // Submit the sanitized form data to the backend
      await API.post("/recipes", {
        ...sanitizedForm,
        cookTime: cookTimeMinutes,
        prepTime: prepTimeMinutes,
        imageUrls,
        imageUrl: imageUrls[0] || ""
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
    } finally {
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
            <div className="add-recipe-form__file-input-container">
              <input
                type="file"
                className="add-recipe-form__file-input"
                id="recipe-image"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="recipe-image" className="add-recipe-form__file-label">
                <UploadIcon aria-hidden="true" />
                <span className="add-recipe-form__file-label-text">
                  {hasImages ? "Add More Images" : "Upload Recipe Images"}
                </span>
                <span className="add-recipe-form__file-label-helper">
                  Select up to {MAX_IMAGE_COUNT} images (PNG, JPG, GIF).
                </span>
              </label>
              <div className="add-recipe-form__file-count" aria-live="polite">
                {selectedImageCount} / {MAX_IMAGE_COUNT} images selected
              </div>
            </div>

            {hasImages && (
              <div className="add-recipe-form__image-preview-grid">
                {images.map((image, idx) => (
                  <div key={image.id ?? `${image.url}-${idx}`} className="add-recipe-form__image-preview-item">
                    <img src={image.url} alt={`Recipe preview ${idx + 1}`} />
                    {image.type === 'local' && (
                      <button
                        type="button"
                        className="add-recipe-form__image-edit"
                        onClick={() => setEditingImageIndex(idx)}
                        disabled={isProcessingImage}
                        aria-label={`Adjust recipe image ${idx + 1}`}
                      >
                        <EditImageIcon aria-hidden="true" />
                      </button>
                    )}
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

      <ImageAdjustModal
        isOpen={editingImageIndex !== null}
        image={editingImageIndex !== null ? images[editingImageIndex] : null}
        onClose={() => setEditingImageIndex(null)}
        onSave={(adjustments) => handleAdjustSave(editingImageIndex, adjustments)}
        isProcessing={isProcessingImage}
      />
    </div>
  );
}

/**
 * Exports the AddRecipe component for use in the app
 */
export default AddRecipe;
