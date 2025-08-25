const express = require("express");
const { verifyToken } = require("../middleware/auth");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const router = express.Router();

/**
 * @route   POST /api/user/save/:id
 * @desc    Save a recipe to a user's collection
 * @access  Private
 */
router.post("/save/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const recipeId = req.params.id;
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
    res.status(500).send("Server error");
  }
});

/**
 * @route   POST /api/user/unsave/:id
 * @desc    Remove a recipe from user's saved collection
 * @access  Private
 */
router.post("/unsave/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const recipeId = req.params.id;
    user.savedRecipes = user.savedRecipes.filter(
      (r) => r.recipe.toString() !== recipeId
    );
    await user.save();
    res.json({ saved: false });
  } catch (err) {
    console.error(err.message);
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
    const user = await User.findById(req.user.id).populate({
      path: "savedRecipes.recipe",
      select: "title imageUrls tags category",
    });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.savedRecipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
