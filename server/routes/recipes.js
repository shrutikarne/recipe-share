/**
 * Recipe routes for personal recipe sharing website
 * Public: GET all recipes, GET single recipe
 * Admin-only: POST (create), PUT (update), DELETE (remove)
 */
const express = require("express");
const rateLimit = require("express-rate-limit");
const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");
const router = express.Router();
const {
  validateRequiredFields,
  validateFields,
  sanitizeBody,
  sanitizeString,
  sanitizeStringArray,
  validateIdParam,
  validateString
} = require("../middleware/validation");
const {
  validateTitle,
  validateDescription,
  validateSteps,
  validateIngredients,
  validateCookTime,
  validateCategory,
  validateDiet,
  validateImageUrl,
  validateImageUrls,
  validateTags,
  validateNutrition
} = require("../middleware/recipeValidation");
const {
  validatePagination,
  validateNumericParams,
  validateBooleanParams,
  sanitizeStringParams
} = require("../middleware/queryValidation");
const config = require("../config/config");
const { verifyAdmin } = require("../middleware/adminAuth");

// Rate limiter for admin recipe modifications
const recipeWriteLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_RECIPE_WRITE,
  message: { msg: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

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
    const recipe = await Recipe.findOne().skip(random);
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   GET /api/recipes/count
 * @desc    Get count of recipes with filters
 * @access  Public
 */
router.get("/count", async (req, res) => {
  try {
    const {
      search,
      category,
      ingredient,
      tag,
      diet,
      cuisine,
      prepTime,
      vegetarian,
      difficulty
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
    if (diet) {
      filter.diet = diet;
    }
    if (cuisine) {
      filter.cuisine = cuisine;
    }
    if (prepTime) {
      filter.prepTime = { $lte: Number(prepTime) };
    }
    if (vegetarian === 'true') {
      filter.isVegetarian = true;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const count = await Recipe.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes with optional filtering
 * @access  Public
 */
router.get("/",
  validatePagination,
  validateNumericParams(['prepTime']),
  validateBooleanParams(['vegetarian']),
  sanitizeStringParams(['search', 'category', 'ingredient', 'tag', 'diet', 'cuisine', 'difficulty']),
  async (req, res) => {
    try {
      const {
        search,
        category,
        ingredient,
        tag,
        diet,
        cuisine,
        prepTime,
        vegetarian,
        difficulty,
        page = 1,
        limit = 10,
        sort = "-createdAt"
      } = req.query;

      // Build filter
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
      if (diet) {
        filter.diet = diet;
      }
      if (cuisine) {
        filter.cuisine = cuisine;
      }
      if (prepTime) {
        filter.prepTime = { $lte: Number(prepTime) };
      }
      if (vegetarian === 'true') {
        filter.isVegetarian = true;
      }
      if (difficulty) {
        filter.difficulty = difficulty;
      }

      // Calculate pagination
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
      const skip = (pageNum - 1) * limitNum;

      // Fetch recipes
      const recipes = await Recipe.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const totalCount = await Recipe.countDocuments(filter);

      res.json({
        recipes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum)
        }
      });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   GET /api/recipes/:id
 * @desc    Get a single recipe by ID
 * @access  Public
 */
router.get("/:id",
  validateIdParam(),
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found" });
      }

      res.json(recipe);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: "Invalid recipe ID" });
      }
      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe (Admin only)
 * @access  Private (Admin)
 */
router.post("/",
  recipeWriteLimiter,
  verifyAdmin,
  validateRequiredFields(['title', 'ingredients', 'steps']),
  validateFields({
    title: validateTitle,
    description: validateDescription,
    ingredients: validateIngredients,
    steps: validateSteps,
    cookTime: validateCookTime,
    category: validateCategory,
    imageUrl: validateImageUrl,
    imageUrls: validateImageUrls,
    tags: validateTags,
    diet: validateDiet,
    nutrition: validateNutrition,
  }),
  sanitizeBody({
    title: sanitizeString,
    description: sanitizeString,
    ingredients: sanitizeStringArray,
    steps: sanitizeStringArray,
    category: sanitizeString,
    imageUrl: sanitizeString,
    imageUrls: sanitizeStringArray,
    tags: sanitizeStringArray
  }),
  async (req, res) => {
    try {
      const newRecipe = new Recipe(req.body);
      const recipe = await newRecipe.save();
      res.status(201).json(recipe);
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          msg: "Validation failed",
          details: err.message
        });
      }
      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update a recipe (Admin only)
 * @access  Private (Admin)
 */
router.put("/:id",
  recipeWriteLimiter,
  verifyAdmin,
  validateIdParam(),
  validateFields({
    title: validateTitle,
    description: validateDescription,
    ingredients: validateIngredients,
    steps: validateSteps,
    cookTime: validateCookTime,
    category: validateCategory,
    imageUrl: validateImageUrl,
    imageUrls: validateImageUrls,
    tags: validateTags,
    diet: validateDiet,
    nutrition: validateNutrition,
  }),
  sanitizeBody({
    title: sanitizeString,
    description: sanitizeString,
    ingredients: sanitizeStringArray,
    steps: sanitizeStringArray,
    category: sanitizeString,
    imageUrl: sanitizeString,
    imageUrls: sanitizeStringArray,
    tags: sanitizeStringArray
  }),
  async (req, res) => {
    try {
      let recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found" });
      }

      // Remove fields that shouldn't be updated
      const { createdAt, ...updateData } = req.body;

      // Update the recipe
      recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      res.json(recipe);
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: "Invalid recipe ID" });
      }

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          msg: "Validation failed",
          details: err.message
        });
      }

      res.status(500).json({ msg: "Server error" });
    }
  });

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete a recipe (Admin only)
 * @access  Private (Admin)
 */
router.delete("/:id",
  recipeWriteLimiter,
  verifyAdmin,
  validateIdParam(),
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found" });
      }

      await Recipe.findByIdAndDelete(req.params.id);
      res.json({ msg: "Recipe removed" });
    } catch (err) {
      if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: "Invalid recipe ID" });
      }
      res.status(500).json({ msg: "Server error" });
    }
  });

module.exports = router;
