
/**
 * @route   PUT /api/recipes/:id
 * @desc    Update a recipe by ID
 * @access  Public (should be protected in production)
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe) return res.status(404).json({ msg: "Recipe not found" });
    res.json(updatedRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete a recipe by ID
 * @access  Public (should be protected in production)
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) return res.status(404).json({ msg: "Recipe not found" });
    res.json({ msg: "Recipe deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");



/**
 * @route   GET /api/recipes
 * @desc    Get all recipes
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("author", "name"); // optional: show author's name
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


/**
 * @route   GET /api/recipes/:id
 * @desc    Get a single recipe by ID
 * @access  Public
 */
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


/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Public (should be protected in production)
 */
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
