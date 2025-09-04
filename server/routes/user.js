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
  isValidObjectId,
  validateString
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

      // Better error handling
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation failed",
          details: err.message
        });
      }

      res.status(500).json({ msg: "Server error" });
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
      
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation failed",
          details: err.message
        });
      }

      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   GET /api/user/saved
 * @desc    Get all recipes saved by the user
 * @access  Private
 */
router.get("/saved",
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate({
          path: 'savedRecipes.recipe',
          select: 'title images category cookTime prepTime'
        });

      if (!user) return res.status(404).json({ msg: "User not found" });

      res.json(user.savedRecipes);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   GET /api/user/saved/collections
 * @desc    Get all unique collection names for the user
 * @access  Private
 */
router.get("/saved/collections",
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const collections = [...new Set(user.savedRecipes.map(r => r.collection))];
      res.json(collections);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   GET /api/user/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/profile",
  verifyToken,
  async (req, res) => {
    try {
      // Fetch user without password field
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      
      // Add stats property to the user object
      const userObject = user.toObject();
      userObject.stats = {
        savedRecipes: user.savedRecipes.length,
        // Add other stats as needed
      };
      
      res.json(userObject);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
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

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation failed",
          details: err.message
        });
      }

      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   GET /api/user/recipes
 * @desc    Get all recipes created by the user
 * @access  Private
 */
router.get("/recipes",
  verifyToken,
  async (req, res) => {
    try {
      const recipes = await Recipe.find({ author: req.user.id })
        .sort({ createdAt: -1 })
        .select('title description images category cookTime');
        
      res.json(recipes);
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  });

module.exports = router;
