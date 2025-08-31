const express = require("express");
const rateLimit = require("express-rate-limit");
const Recipe = require("../models/Recipe");
const router = express.Router();
const {
  validateRequiredFields,
  validateFields,
  sanitizeBody,
  sanitizeString,
  sanitizeStringArray,
  validateIdParam
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
  validateNutrition,
  validateStorySteps,
  validateComments,
  validateRatings
} = require("../middleware/recipeValidation");
const {
  validatePagination,
  validateNumericParams,
  validateBooleanParams,
  sanitizeStringParams
} = require("../middleware/queryValidation");

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
    res.status(500).send("Server error");
  }
});
const config = require("../config/config");

// Rate limiter for posting comments
const commentLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_COMMENT,
  message: {
    msg: "Too many comments created from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter for recipe modifications
const recipeWriteLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_RECIPE_WRITE,
  message: { msg: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
const { verifyToken } = require("../middleware/auth");

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
      filter.dietaryPreferences = diet;
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
    res.status(500).send("Server error");
  }
});

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes
 * @access  Public
 */
// Enhanced: filter by tags, infinite scroll, etc.
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
      if (diet) {
        filter.dietaryPreferences = diet;
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

      const recipes = await Recipe.find(filter)
        .skip(Number(skip))
        .limit(Number(limit))
        .populate("author", "name");
      res.json(recipes);
    } catch (err) {
      res.status(500).send("Server error");
    }
  });

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Public (should be protected in production)
 */
// Enhanced: support new fields (imageUrls, tags, ratings, nutrition, funFacts, storySteps, stepImages)
router.post("/",
  recipeWriteLimiter,
  verifyToken,
  validateRequiredFields(['title', 'steps']),
  validateFields({
    title: validateTitle,
    description: validateDescription,
    steps: validateSteps,
    ingredients: validateIngredients,
    cookTime: validateCookTime,
    category: validateCategory,
    diet: validateDiet,
    imageUrl: validateImageUrl,
    imageUrls: validateImageUrls,
    tags: validateTags,
    nutrition: validateNutrition,
    storySteps: validateStorySteps
  }),
  sanitizeBody({
    title: sanitizeString,
    description: sanitizeString,
    category: sanitizeString,
    diet: sanitizeString,
    imageUrl: sanitizeString,
    steps: sanitizeStringArray,
    ingredients: sanitizeStringArray,
    tags: sanitizeStringArray,
    funFacts: sanitizeStringArray
  }),
  async (req, res) => {
    try {
      // Add author from the authenticated user
      const newRecipe = new Recipe({
        ...req.body,
        author: req.user.id // Set author from authenticated user
      });

      const savedRecipe = await newRecipe.save();
      res.json(savedRecipe);
    } catch (err) {

      // Better error handling for validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = {};

        for (const field in err.errors) {
          validationErrors[field] = err.errors[field].message;
        }

        return res.status(400).json({
          error: "Validation failed",
          details: validationErrors
        });
      }

      res.status(500).send("Server error");
    }
  });

/**
 * @route   GET /api/recipes/autocomplete
 * @desc    Get recipe title suggestions for autocomplete
 * @access  Public
 */
router.get("/autocomplete",
  sanitizeStringParams(['query']),
  async (req, res) => {
    try {
      const { query } = req.query;

      // Validate query parameter
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        return res.json([]);
      }

      // Prevent potentially expensive regex operations by requiring minimum length
      if (query.trim().length < 2) {
        return res.json([]);
      }

      // Escape special regex characters to prevent ReDoS attacks
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Find up to 10 recipe titles that match the query (case-insensitive, partial match)
      const suggestions = await Recipe.find({
        title: { $regex: escapedQuery, $options: "i" }
      })
        .limit(10)
        .select("title _id");

      res.json(suggestions);
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
router.get("/:id", validateIdParam(), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "author",
      "name _id"
    );
    if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    console.error(err.message);

    // Better error handling for invalid ID format
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).json({ msg: "Invalid recipe ID format" });
    }

    res.status(500).send("Server error");
  }
});

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update a recipe by ID
 * @access  Private (requires authentication)
 */
router.put("/:id",
  recipeWriteLimiter,
  verifyToken,
  validateIdParam(),
  validateFields({
    title: validateTitle,
    description: validateDescription,
    steps: validateSteps,
    ingredients: validateIngredients,
    cookTime: validateCookTime,
    category: validateCategory,
    diet: validateDiet,
    imageUrl: validateImageUrl,
    imageUrls: validateImageUrls,
    tags: validateTags,
    nutrition: validateNutrition,
    storySteps: validateStorySteps
  }),
  sanitizeBody({
    title: sanitizeString,
    description: sanitizeString,
    category: sanitizeString,
    diet: sanitizeString,
    imageUrl: sanitizeString,
    steps: sanitizeStringArray,
    ingredients: sanitizeStringArray,
    tags: sanitizeStringArray,
    funFacts: sanitizeStringArray
  }),
  async (req, res) => {
    try {
      // First find the recipe to check ownership
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found" });
      }

      // Check if user is the author of the recipe
      if (recipe.author && recipe.author.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Not authorized to update this recipe" });
      }

      // Create sanitized update object (don't allow changing the author)
      const updateData = { ...req.body };
      delete updateData.author; // Prevent changing the author

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json(updatedRecipe);
    } catch (err) {
      console.error(err.message);

      // Better error handling for validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = {};

        for (const field in err.errors) {
          validationErrors[field] = err.errors[field].message;
        }

        return res.status(400).json({
          error: "Validation failed",
          details: validationErrors
        });
      }

      res.status(500).send("Server error");
    }
  });
/**
 * @route   POST /api/recipes/:id/rate
 * @desc    Rate a recipe (1-5 stars)
 * @access  Private
 */
router.post("/:id/rate",
  recipeWriteLimiter,
  verifyToken,
  validateIdParam(),
  validateRequiredFields(['value']),
  validateFields({
    value: (value) => validateNumber(value, { min: 1, max: 5, integer: true })
  }),
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

      const userId = req.user.id;
      const { value } = req.body;

      // Remove previous rating if exists
      recipe.ratings = recipe.ratings.filter((r) => r.userId !== userId);
      recipe.ratings.push({ userId, value: Math.round(value) }); // Ensure integer
      await recipe.save();

      // Calculate average
      const avg =
        recipe.ratings.reduce((a, b) => a + b.value, 0) / recipe.ratings.length;

      res.json({
        avg: parseFloat(avg.toFixed(1)), // Format to 1 decimal place
        count: recipe.ratings.length
      });
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
 * @route   DELETE /api/recipes/:id
 * @desc    Delete a recipe by ID
 * @access  Private (requires authentication)
 */
router.delete("/:id",
  recipeWriteLimiter,
  verifyToken,
  validateIdParam(),
  async (req, res) => {
    try {
      // First find the recipe to check ownership
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ msg: "Recipe not found" });
      }

      // Check if user is the author of the recipe
      if (recipe.author && recipe.author.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Not authorized to delete this recipe" });
      }

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

// Autocomplete endpoint moved to higher in the file to avoid conflict with :id route

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
router.post("/:id/comments",
  commentLimiter,
  verifyToken,
  validateIdParam(),
  validateRequiredFields(['text']),
  validateFields({
    text: (text) => validateString(text, { min: 1, max: 500 })
  }),
  sanitizeBody({
    text: sanitizeString
  }),
  async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      if (!recipe) return res.status(404).json({ msg: "Recipe not found" });

      const { text } = req.body;
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

module.exports = router;
// server/routes/recipes.js
// Ensure the recipe routes are set up correctly
