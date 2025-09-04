/**
 * Recipe validation functions
 * Contains specialized validation for recipe data
 */
const {
  validateString,
  validateArray,
  validateNumber,
  validateUrl,
  isValidObjectId
} = require('./validation');

/**
 * Validates recipe title
 * @param {string} title - The recipe title to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateTitle = (title) => validateString(title, { min: 3, max: 100 });

/**
 * Validates recipe steps
 * @param {Array} steps - The recipe steps to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateSteps = (steps) => {
  if (!Array.isArray(steps)) {
    return 'Steps must be an array';
  }

  if (steps.length === 0) {
    return 'At least one step is required';
  }

  return validateArray(steps, (step) => validateString(step, { min: 1 }));
};

/**
 * Validates recipe ingredients
 * @param {Array} ingredients - The recipe ingredients to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) {
    return 'Ingredients must be an array';
  }

  if (ingredients.length === 0) {
    return 'At least one ingredient is required';
  }

  return validateArray(ingredients, (ingredient) => validateString(ingredient, { min: 1 }));
};

/**
 * Validates cooking time
 * @param {number} cookTime - The cooking time in minutes
 * @returns {boolean|string} True if valid, error message if not
 */
const validateCookTime = (cookTime) => validateNumber(cookTime, { min: 1, max: 10080 }); // Max 1 week in minutes

/**
 * Validates recipe category
 * @param {string} category - The recipe category
 * @returns {boolean|string} True if valid, error message if not
 */
const validateCategory = (category) => validateString(category, { min: 2, max: 50 });

/**
 * Validates an array of image URLs
 * @param {Array} urls - The image URLs to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateImageUrls = (urls) => {
  if (!Array.isArray(urls)) {
    return 'Image URLs must be an array';
  }

  return validateArray(urls, validateUrl);
};

/**
 * Validates tags array
 * @param {Array} tags - The tags to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    return 'Tags must be an array';
  }

  return validateArray(tags, (tag) => validateString(tag, { min: 1, max: 30 }));
};

/**
 * Validates nutrition information
 * @param {Object} nutrition - The nutrition information
 * @returns {boolean|string} True if valid, error message if not
 */
const validateNutrition = (nutrition) => {
  if (!nutrition || typeof nutrition !== 'object') {
    return 'Nutrition must be an object';
  }

  const { calories, protein, carbs, fat } = nutrition;

  if (calories !== undefined) {
    const caloriesResult = validateNumber(calories, { min: 0 });
    if (caloriesResult !== true) return `Calories: ${caloriesResult}`;
  }

  if (protein !== undefined) {
    const proteinResult = validateNumber(protein, { min: 0 });
    if (proteinResult !== true) return `Protein: ${proteinResult}`;
  }

  if (carbs !== undefined) {
    const carbsResult = validateNumber(carbs, { min: 0 });
    if (carbsResult !== true) return `Carbs: ${carbsResult}`;
  }

  if (fat !== undefined) {
    const fatResult = validateNumber(fat, { min: 0 });
    if (fatResult !== true) return `Fat: ${fatResult}`;
  }

  return true;
};



/**
 * Validates a comment object
 * @param {Object} comment - The comment to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateComment = (comment) => {
  if (!comment || typeof comment !== 'object') {
    return 'Comment must be an object';
  }

  const { userId, text } = comment;

  if (!userId) {
    return 'User ID is required for comment';
  }

  if (!isValidObjectId(userId)) {
    return 'Invalid user ID format';
  }

  if (!text) {
    return 'Comment text is required';
  }

  const textResult = validateString(text, { min: 1, max: 500 });
  if (textResult !== true) return `Comment text: ${textResult}`;

  return true;
};

/**
 * Validates an array of comments
 * @param {Array} comments - The comments to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateComments = (comments) => {
  if (!Array.isArray(comments)) {
    return 'Comments must be an array';
  }

  return validateArray(comments, validateComment);
};

/**
 * Validates a rating object
 * @param {Object} rating - The rating to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateRating = (rating) => {
  if (!rating || typeof rating !== 'object') {
    return 'Rating must be an object';
  }

  const { userId, value } = rating;

  if (!userId) {
    return 'User ID is required for rating';
  }

  if (!isValidObjectId(userId)) {
    return 'Invalid user ID format';
  }

  const valueResult = validateNumber(value, { min: 1, max: 5, integer: true });
  if (valueResult !== true) return `Rating value: ${valueResult}`;

  return true;
};

/**
 * Validates an array of ratings
 * @param {Array} ratings - The ratings to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateRatings = (ratings) => {
  if (!Array.isArray(ratings)) {
    return 'Ratings must be an array';
  }

  return validateArray(ratings, validateRating);
};

/**
 * Validates recipe description
 * @param {string} description - The recipe description to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateDescription = (description) => {
  if (!description) return true; // Optional field
  return validateString(description, { max: 2000 });
};

/**
 * Validates diet information
 * @param {string} diet - The diet information to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateDiet = (diet) => {
  if (!diet) return true; // Optional field
  return validateString(diet, { max: 50 });
};

/**
 * Validates single imageUrl
 * @param {string} imageUrl - The image URL to validate
 * @returns {boolean|string} True if valid, error message if not
 */
const validateImageUrl = (imageUrl) => {
  if (!imageUrl) return true; // Optional field
  return validateUrl(imageUrl);
};

module.exports = {
  validateTitle,
  validateDescription,
  validateSteps,
  validateIngredients,
  validateCookTime,
  validateCategory,
  validateDiet,
  validateImageUrl,
  validateImageUrls,
  validateTags,
  validateNutrition,
  validateComments,
  validateRatings
};
