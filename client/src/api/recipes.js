import { apiGet, apiPost, apiPut, apiDelete } from './apiWrapper';

/**
 * Fetch a single recipe by its ID
 * @param {string} id - The recipe ID
 * @returns {Promise<Object>} - The recipe object
 */
export const fetchRecipe = async (id) => {
    return await apiGet(`/recipes/${id}`);
};

/**
 * Fetch all recipes with optional pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of recipes per page (default: 10)
 * @param {object} filters - Optional filters like category, cuisine, etc.
 * @returns {Promise<{recipes: Array, totalCount: number, pages: number}>} - Recipes data
 */
export const fetchRecipes = async (page = 1, limit = 10, filters = {}) => {
    return await apiGet('/recipes', {
        params: { page, limit, ...filters }
    });
};

/**
 * Create a new recipe
 * @param {Object} recipeData - The recipe data to submit
 * @returns {Promise<Object>} - The created recipe
 */
export const createRecipe = async (recipeData) => {
    return await apiPost('/recipes', recipeData);
};

/**
 * Update an existing recipe
 * @param {string} id - Recipe ID
 * @param {Object} recipeData - Updated recipe data
 * @returns {Promise<Object>} - The updated recipe
 */
export const updateRecipe = async (id, recipeData) => {
    return await apiPut(`/recipes/${id}`, recipeData);
};

/**
 * Delete a recipe
 * @param {string} id - Recipe ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteRecipe = async (id) => {
    return await apiDelete(`/recipes/${id}`);
};

/**
 * Add a comment to a recipe
 * @param {string} recipeId - Recipe ID
 * @param {string} comment - Comment text
 * @returns {Promise<Object>} - Updated recipe with new comment
 */
export const addComment = async (recipeId, comment) => {
    return await apiPost(`/recipes/${recipeId}/comments`, { text: comment });
};
