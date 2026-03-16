/**
 * Recipe model schema
 * Represents a recipe in the personal recipe sharing site
 * Simplified: only admin can create/update/delete, anyone can view
 */
const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ingredients: [String], // List of ingredients
    steps: [String], // List of preparation steps
    category: String, // Recipe category
    prepTime: Number, // Preparation time in minutes
    cookTime: Number, // Cooking time in minutes
    imageUrls: [String], // Multiple image URLs
    imageUrl: String, // Main image URL (for backwards compatibility)
    diet: String, // Dietary preference (e.g., vegetarian, vegan, etc.)
    tags: [String], // e.g., ["Vegan", "Gluten-Free"]
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    funFacts: [String], // Array of fun facts/trivia
    stepImages: [String], // Step-by-step images
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
