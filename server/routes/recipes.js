const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");


// GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("author", "name"); // optional: show author's name
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET a single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("author", "name");
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// POST a new recipe
router.post("/", async (req, res) => {
  const {
    title,
    description,
    ingredients,
    steps,
    category,
    cookTime,
    imageUrl,
    author,
  } = req.body;
  try {
    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      steps,
      category,
      cookTime,
      imageUrl,
      author,
    });
    const savedRecipe = await newRecipe.save();
    res.json(savedRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
// server/routes/recipes.js
// Ensure the recipe routes are set up correctly
