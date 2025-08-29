const express = require("express");
const { verifyToken } = require("../middleware/auth");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const router = express.Router();
const {
  validateRequiredFields,
  validateFields,
  validateIdParam,
  sanitizeBody,
  sanitizeString,
  isValidObjectId
} = require("../middleware/validation");

/**
 * @route   POST /api/user/save/:id
 * @desc    Save a recipe to a user's collection
 * @access  Private
 */
router.post("/save/:id",
  verifyToken,
  validateIdParam(),
  validateFields({
    collection: (collection) => collection ? validateString(collection, { min: 1, max: 50 }) : true
  }),
  sanitizeBody({
    collection: sanitizeString
  }),
  async (req, res) => {
    try {
      // Validate that the recipe exists
      const recipeId = req.params.id;
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found" });
      }

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const { collection = "General" } = req.body;

      // Prevent duplicate saves
      if (user.savedRecipes.some((r) => r.recipe.toString() === recipeId)) {
        return res.status(400).json({ msg: "Recipe already saved" });
      }

      user.savedRecipes.push({ recipe: recipeId, collection });
      await user.save();
      res.json({ saved: true });
    } catch (err) {
      console.error(err.message);

      // Better error handling
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation failed",
          details: err.message
        });
      }

      res.status(500).send("Server error");
    }
  });

/**
 * @route   POST /api/user/unsave/:id
 * @desc    Remove a recipe from user's saved collection
 * @access  Private
 */
router.post("/unsave/:id",
  verifyToken,
  validateIdParam(),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const recipeId = req.params.id;

      // Check if recipe is in user's saved collection
      const savedRecipe = user.savedRecipes.find(
        (r) => r.recipe.toString() === recipeId
      );

      if (!savedRecipe) {
        return res.status(400).json({ msg: "Recipe not saved by this user" });
      }

      user.savedRecipes = user.savedRecipes.filter(
        (r) => r.recipe.toString() !== recipeId
      );

      await user.save();
      res.json({ saved: false });
    } catch (err) {
      console.error(err.message);

      // Better error handling
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation failed",
          details: err.message
        });
      }

      res.status(500).send("Server error");
    }
  });

/**
 * @route   GET /api/user/saved
 * @desc    Get all saved recipes for the user
 * @access  Private
 */
router.get("/saved", verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id || !isValidObjectId(req.user.id)) {
      return res.status(401).json({ msg: "Valid user authentication required" });
    }

    const user = await User.findById(req.user.id).populate({
      path: "savedRecipes.recipe",
      select: "title imageUrls tags category",
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Filter out any null references (in case recipes were deleted)
    const validSavedRecipes = user.savedRecipes.filter(item => item.recipe);

    res.json(validSavedRecipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route   GET /api/user/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id || !isValidObjectId(req.user.id)) {
      return res.status(401).json({ msg: "Valid user authentication required" });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get user's authored recipes count
    const recipesCount = await Recipe.countDocuments({ author: req.user.id });

    // Get user's saved recipes count
    const savedCount = user.savedRecipes.length;

    // Return user profile with additional stats
    res.json({
      ...user.toJSON(),
      stats: {
        recipesCount,
        savedCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile",
  verifyToken,
  validateFields({
    name: (name) => name ? validateString(name, { min: 2, max: 50 }) : true,
    avatar: (url) => url ? validateString(url, { min: 5, max: 500 }) : true
  }),
  sanitizeBody({
    name: sanitizeString,
    avatar: sanitizeString
  }),
  async (req, res) => {
    try {
      if (!req.user || !req.user.id || !isValidObjectId(req.user.id)) {
        return res.status(401).json({ msg: "Valid user authentication required" });
      }

      const { name, avatar } = req.body;

      // Build update object with only provided fields
      const updateFields = {};
      if (name) updateFields.name = name;
      if (avatar) updateFields.avatar = avatar;

      // Update the user profile
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ msg: "User not found" });
      }

      res.json(updatedUser);
    } catch (err) {
      console.error(err.message);

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation failed",
          details: err.message
        });
      }

      res.status(500).send("Server error");
    }
  });

/**
 * @route   GET /api/user/recipes
 * @desc    Get recipes created by the current user
 * @access  Private
 */
router.get("/recipes", verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id || !isValidObjectId(req.user.id)) {
      return res.status(401).json({ msg: "Valid user authentication required" });
    }

    const recipes = await Recipe.find({ author: req.user.id })
      .select("title imageUrls tags category createdAt")
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
