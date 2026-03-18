import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import baseRecipes from "../data/recipes.json";

const STORAGE_KEY = "recipeShare.recipes";

/**
 * @typedef {Object} RecipesContextValue
 * @property {Array<Object>} recipes - Current recipe collection available to the UI.
 * @property {(recipes: Array<Object>) => void} setRecipes - Setter for the recipes state.
 * @property {() => void} resetRecipes - Helper that restores the bundled seed recipes.
 */

const RecipesContext = createContext(
  /** @type {RecipesContextValue} */
  ({
    recipes: baseRecipes,
    setRecipes: () => {},
    resetRecipes: () => {}
  })
);

/**
 * Attempt to load persisted recipes from localStorage; fallback to seed data.
 * @returns {Array<Object>}
 */
const readStoredRecipes = () => {
  if (typeof window === "undefined") return baseRecipes;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read stored recipes", err);
  }
  return baseRecipes;
};

/**
 * Context provider wrapping the app so recipes stay in sync with localStorage.
 *
 * @param {{children: React.ReactNode}} props - Provider props.
 * @returns {JSX.Element}
 */
export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState(() => readStoredRecipes());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (err) {
      console.warn("Unable to persist recipes locally", err);
    }
  }, [recipes]);

  const resetRecipes = () => setRecipes(baseRecipes);

  const value = useMemo(() => ({ recipes, setRecipes, resetRecipes }), [recipes]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

/**
 * Hook for consuming the Recipes context.
 * @returns {RecipesContextValue}
 */
export const useRecipes = () => useContext(RecipesContext);
