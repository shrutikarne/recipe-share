const express = require("express");
const rateLimit = require("express-rate-limit");
const Recipe = require("../models/Recipe");
const router = express.Router();

/**
 * @route   GET /api/recipes/random
 * @desc    Get a random recipe
 * @access  Public
 */
router.get("/random", async (req, res) => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) return res.status(404).json({ msg: "No recipes found" });
    const random = Math.floor(Math.random() * count);
    const recipe = await Recipe.findOne().skip(random).populate("author", "name _id");
    res.json(recipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// Rate limiter for posting comments (e.g., max 5 requests per minute per IP)
const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    msg: "Too many comments created from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for recipe modifications (e.g., max 10 requests per minute per IP)
const recipeWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { msg: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
const { verifyToken } = require("../middleware/auth");

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes
 * @access  Public
 */
// Enhanced: filter by tags, infinite scroll, etc.
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      ingredient,
      tag,
      skip = 0,
      limit = 20,
    } = req.query;
    let filter = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (ingredient && typeof ingredient === "string") {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.ingredients = {
        $elemMatch: { $regex: escapeRegex(ingredient), $options: "i" },
      };
    }
    if (tag) {
      filter.tags = tag;
    }
    const recipes = await Recipe.find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .populate("author", "name");
    res.json(recipes);
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
// Enhanced: support new fields (imageUrls, tags, ratings, nutrition, funFacts, storySteps, stepImages)
router.post("/", recipeWriteLimiter, verifyToken, async (req, res) => {
  try {
    const newRecipe = new Recipe({
      ...req.body,
    });
    const savedRecipe = await newRecipe.save();
    res.json(savedRecipe);
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
    const recipe = await Recipe.findById(req.params.id).populate(
      "author",
      "name _id"
    );
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    res.json(recipe);
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
router.put("/:id", recipeWriteLimiter, verifyToken, async (req, res) => {
  const mongoose = require("mongoose");
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "Invalid recipe ID" });
  }
  // Whitelist fields to update
  // Allow updating all fields in schema
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe)
      return res.status(404).json({ msg: "Recipe not found" });
    res.json(updatedRecipe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
/**
 * @route   POST /api/recipes/:id/rate
 * @desc    Rate a recipe (1-5 stars)
 * @access  Private
 */
router.post("/:id/rate", recipeWriteLimiter, verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    const userId = req.user.id;
    const { value } = req.body;
    if (!value || value < 1 || value > 5)
      return res.status(400).json({ msg: "Invalid rating value" });
    // Remove previous rating if exists
    recipe.ratings = recipe.ratings.filter((r) => r.userId !== userId);
    recipe.ratings.push({ userId, value });
    await recipe.save();
    // Calculate average
    const avg =
      recipe.ratings.reduce((a, b) => a + b.value, 0) / recipe.ratings.length;
    res.json({ avg, count: recipe.ratings.length });
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
router.delete("/:id", recipeWriteLimiter, verifyToken, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe)
      return res.status(404).json({ msg: "Recipe not found" });
    res.json({ msg: "Recipe deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route   POST /api/recipes/:id/like
 * @desc    Like or unlike a recipe (toggle)
 * @access  Private
 */
router.post("/:id/like", recipeWriteLimiter, verifyToken, async (req, res) => {
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

/**
 * @route   POST /api/recipes/:id/comments
 * @desc    Add a comment to a recipe
 * @access  Private
 */
router.post("/:id/comments", commentLimiter, verifyToken, async (req, res) => {
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
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
// server/routes/recipes.js
// Ensure the recipe routes are set up correctly
