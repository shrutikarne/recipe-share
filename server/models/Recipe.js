/**
 * Recipe model schema
 * Represents a recipe posted by a user
 */
const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: String, // Recipe title
    description: String, // Short description
    ingredients: [String], // List of ingredients
    steps: [String], // List of preparation steps
    category: String, // Recipe category
    cookTime: Number, // Cooking time in minutes
    imageUrl: String, // Optional image URL
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
    likes: [String], // Array of user IDs who liked
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
