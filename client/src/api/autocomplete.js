// Autocomplete API endpoint for recipe titles
// GET /api/recipes/autocomplete?query=... returns [{_id, title}]
import { apiGetWithRetry } from "./apiWrapper";

/**
 * Fetches recipe title suggestions for autocomplete based on a query string.
 * @param {string} query - The search query for recipe titles.
 * @returns {Promise<string[]>} Promise resolving to an array of recipe title strings.
 */
export async function fetchRecipeAutocomplete(query) {
  if (!query || query.length < 2) return [];
  const data = await apiGetWithRetry("/recipes/autocomplete", { params: { query } }, 2, 200);
  return data.map(recipe => recipe.title);
}
