import API from './api';

/**
 * Fetch a single recipe by its ID
 * @param {string} id - The recipe ID
 * @returns {Promise<Object>} - The recipe object
 */
export const fetchRecipe = async (id) => {
    try {
        const response = await API.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);
        throw error;
    }
};

/**
 * Fetch all recipes with optional pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of recipes per page (default: 10)
 * @param {object} filters - Optional filters like category, cuisine, etc.
 * @returns {Promise<{recipes: Array, totalCount: number, pages: number}>} - Recipes data
 */
export const fetchRecipes = async (page = 1, limit = 10, filters = {}) => {
    try {
        const response = await API.get('/recipes', {
            params: {
                page,
                limit,
                ...filters
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
    }
};

/**
 * Create a new recipe
 * @param {Object} recipeData - The recipe data to submit
 * @returns {Promise<Object>} - The created recipe
 */
export const createRecipe = async (recipeData) => {
    try {
        const response = await API.post('/recipes', recipeData);
        return response.data;
    } catch (error) {
        console.error('Error creating recipe:', error);
        throw error;
    }
};

/**
 * Update an existing recipe
 * @param {string} id - Recipe ID
 * @param {Object} recipeData - Updated recipe data
 * @returns {Promise<Object>} - The updated recipe
 */
export const updateRecipe = async (id, recipeData) => {
    try {
        const response = await API.put(`/recipes/${id}`, recipeData);
        return response.data;
    } catch (error) {
        console.error(`Error updating recipe ${id}:`, error);
        throw error;
    }
};

/**
 * Delete a recipe
 * @param {string} id - Recipe ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteRecipe = async (id) => {
    try {
        const response = await API.delete(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting recipe ${id}:`, error);
        throw error;
    }
};

/**
 * Add a comment to a recipe
 * @param {string} recipeId - Recipe ID
 * @param {string} comment - Comment text
 * @returns {Promise<Object>} - Updated recipe with new comment
 */
export const addComment = async (recipeId, comment) => {
    try {
        const response = await API.post(`/recipes/${recipeId}/comments`, { text: comment });
        return response.data;
    } catch (error) {
        console.error(`Error adding comment to recipe ${recipeId}:`, error);
        throw error;
    }
};
