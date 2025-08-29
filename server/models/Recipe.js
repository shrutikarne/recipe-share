/**
 * Recipe model schema
 * Represents a recipe posted by a user
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
    cookTime: Number, // Cooking time in minutes
    imageUrls: [String], // Multiple image URLs
    imageUrl: String, // Main image URL (for backwards compatibility)
    diet: String, // Dietary preference (e.g., vegetarian, vegan, etc.)
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
    tags: [String], // e.g., ["Vegan", "Gluten-Free"]
    likes: [String], // Array of user IDs who liked
    ratings: [
      {
        userId: String, // ID of user who rated
        value: { type: Number, min: 1, max: 5 }, // Star value
      },
    ],
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      // Add more as needed
    },
    funFacts: [String], // Array of fun facts/trivia
    storySteps: [
      {
        text: String, // Step description
        mediaUrl: String, // Image or video URL
      },
    ],
    stepImages: [String], // Step-by-step images
    comments: [
      {
        userId: String, // ID of user who commented
        text: String, // Comment text
        createdAt: { type: Date, default: Date.now }, // Timestamp
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);
