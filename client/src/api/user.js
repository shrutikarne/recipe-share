/**
 * User API functions with standardized error handling
 */
import { apiGet, apiPost, apiPut } from './apiWrapper';

/**
 * Get the current user's profile
 * @returns {Promise} Promise that resolves to user profile data
 */
export const getUserProfile = async () => {
  return await apiGet('/user/profile', {}, 'Failed to retrieve your profile');
};

/**
 * Update the current user's profile
 * @param {Object} profileData - Data to update in the user's profile (name, avatar)
 * @returns {Promise} Promise that resolves to updated user data
 */
export const updateUserProfile = async (profileData) => {
  return await apiPut('/user/profile', profileData, {}, 'Failed to update profile');
};

/**
 * Get recipes created by the current user
 * @returns {Promise} Promise that resolves to an array of recipe data
 */
export const getUserRecipes = async () => {
  return await apiGet('/user/recipes', {}, 'Failed to retrieve your recipes');
};

/**
 * Get recipes saved by the current user
 * @returns {Promise} Promise that resolves to an array of saved recipe data
 */
export const getSavedRecipes = async () => {
  return await apiGet('/user/saved', {}, 'Failed to retrieve your saved recipes');
};

/**
 * Save a recipe to the user's collection
 * @param {string} recipeId - ID of the recipe to save
 * @param {string} collection - Name of the collection to save to (default: "General")
 * @returns {Promise} Promise that resolves to success message
 */
export const saveRecipe = async (recipeId, collection = "General") => {
  return await apiPost(`/user/save/${recipeId}`, { collection }, {}, 'Failed to save recipe');
};

/**
 * Remove a recipe from the user's saved collection
 * @param {string} recipeId - ID of the recipe to remove from saved
 * @returns {Promise} Promise that resolves to success message
 */
export const unsaveRecipe = async (recipeId) => {
  return await apiPost(`/user/unsave/${recipeId}`, {}, {}, 'Failed to remove recipe from saved collection');
};
