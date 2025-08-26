// Autocomplete API endpoint for recipe titles
// GET /api/recipes/autocomplete?query=... returns [{_id, title}]
import API from "../api/api";

export async function fetchRecipeAutocomplete(query) {
  if (!query || query.length < 2) return [];
  const res = await API.get("/recipes/autocomplete", { params: { query } });
  return res.data;
}
