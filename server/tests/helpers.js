/**
 * Test helpers for setting up test environment and creating fixtures
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const config = require('../config/config');

/**
 * Connect to test database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recipe-share-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('Error connecting to test database:', error);
    process.exit(1);
  }
};

/**
 * Close database connection
 */
const closeDB = async () => {
  await mongoose.connection.close();
};

/**
 * Clear all collections
 */
const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({});
    }
  }
};

/**
 * Create a test user and return with auth token
 * @param {Object} userData - Custom user data to override defaults
 * @returns {Object} User object and auth token
 */
const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    name: 'Test User',
    email: `test.${Date.now()}@example.com`,
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1c7b26', // 'password123'
  };

  const user = await User.create({
    ...defaultUserData,
    ...userData,
  });

  const token = jwt.sign(
    { user: { id: user._id } },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

/**
 * Create a test recipe
 * @param {string} userId - User ID to set as author
 * @param {Object} recipeData - Custom recipe data to override defaults
 * @returns {Object} Created recipe
 */
const createTestRecipe = async (userId, recipeData = {}) => {
  const defaultRecipeData = {
    title: `Test Recipe ${Date.now()}`,
    description: 'This is a test recipe description',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    steps: ['Step 1', 'Step 2'],
    category: 'Dessert',
    cookTime: 30,
    author: userId
  };

  const recipe = await Recipe.create({
    ...defaultRecipeData,
    ...recipeData,
  });

  return recipe;
};

/**
 * Get authorization headers with token
 * @param {string} token - JWT token
 * @returns {Object} Headers object
 */
const authHeader = (token) => ({
  Authorization: `Bearer ${token}`
});

module.exports = {
  connectDB,
  closeDB,
  clearDatabase,
  createTestUser,
  createTestRecipe,
  authHeader
};
