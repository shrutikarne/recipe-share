/**
 * @route   POST /api/recipes/:id/comments
 * @desc    Add a comment to a recipe
 * @access  Private
 */
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "Comment text required" });
    const comment = {
      userId: req.user.id,
      text,
      createdAt: new Date(),
    };
    recipe.comments.push(comment);
    await recipe.save();
    res.json(recipe.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route   GET /api/recipes/:id/comments
 * @desc    Get all comments for a recipe
 * @access  Public
 */
router.get("/:id/comments", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    res.json(recipe.comments || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const auth = require("../middleware/auth");
/**
 * @route   POST /api/recipes/:id/like
 * @desc    Like or unlike a recipe (toggle)
 * @access  Private
 */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    const userId = req.user.id;
    const liked = recipe.likes.includes(userId);
    if (liked) {
      recipe.likes = recipe.likes.filter((id) => id !== userId);
    } else {
      recipe.likes.push(userId);
    }
    await recipe.save();
    res.json({ likes: recipe.likes.length, liked: !liked });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

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

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes
 * @access  Public
 */
// GET /api/recipes?search=...&category=...&ingredient=...
router.get("/", async (req, res) => {
  try {
    const { search, category, ingredient } = req.query;
    let filter = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (ingredient) {
      filter.ingredients = { $elemMatch: { $regex: ingredient, $options: "i" } };
    }
    const recipes = await Recipe.find(filter).populate("author", "name");
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
    const recipe = await Recipe.findById(req.params.id).populate("author", "name _id");
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
