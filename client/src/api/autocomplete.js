// Autocomplete API endpoint for recipe titles
// GET /api/recipes/autocomplete?query=... returns [{_id, title}]
import API from "../api/api";

/**
 * Fetches recipe title suggestions for autocomplete based on a query string.
 * @param {string} query - The search query for recipe titles.
 * @returns {Promise<string[]>} Promise resolving to an array of recipe title strings.
 */
export async function fetchRecipeAutocomplete(query) {
  if (!query || query.length < 2) return [];
  const res = await API.get("/recipes/autocomplete", { params: { query } });
  return res.data.map(recipe => recipe.title); // Map to get just the titles as strings
}
