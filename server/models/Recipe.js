const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  ingredients: [String],
  steps: [String],
  category: String,
  cookTime: Number,
  imageUrl: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [String],
  comments: [
    {
      userId: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Recipe", RecipeSchema);
