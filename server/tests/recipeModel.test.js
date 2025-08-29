const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const { connectDB, closeDB, clearDatabase } = require('./helpers');

describe("Recipe Model", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should require a title", async () => {
    const recipe = new Recipe({ description: "desc" });
    let err;
    try {
      await recipe.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors && err.errors.title).toBeDefined();
  });

  it("should save a valid recipe", async () => {
    const recipe = new Recipe({
      title: "Test",
      description: "desc",
      ingredients: ["a"],
      steps: ["b"],
    });
    let err;
    try {
      await recipe.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeUndefined();
  });

  it('should save a complete recipe with all fields', async () => {
    const authorId = new mongoose.Types.ObjectId();

    const recipe = new Recipe({
      title: 'Complete Test Recipe',
      description: 'This is a detailed recipe description.',
      ingredients: ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'],
      steps: ['Step 1', 'Step 2', 'Step 3'],
      category: 'Main Dish',
      cookTime: 45,
      imageUrls: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
      imageUrl: 'http://example.com/main.jpg',
      diet: 'Vegetarian',
      author: authorId,
      tags: ['Quick', 'Easy', 'Vegetarian'],
      nutrition: {
        calories: 450,
        protein: 10,
        carbs: 30,
        fat: 15
      },
      funFacts: ['Fact 1', 'Fact 2'],
      storySteps: [
        { text: 'Story part 1', mediaUrl: 'http://example.com/story1.jpg' },
        { text: 'Story part 2', mediaUrl: 'http://example.com/story2.jpg' }
      ],
      stepImages: ['http://example.com/step1.jpg', 'http://example.com/step2.jpg']
    });

    const savedRecipe = await recipe.save();

    expect(savedRecipe._id).toBeDefined();
    expect(savedRecipe.title).toBe('Complete Test Recipe');
    expect(savedRecipe.ingredients).toHaveLength(3);
    expect(savedRecipe.steps).toHaveLength(3);
    expect(savedRecipe.nutrition.calories).toBe(450);
    expect(savedRecipe.author.toString()).toBe(authorId.toString());
  });

  it('should add a comment to a recipe', async () => {
    const userId = new mongoose.Types.ObjectId();

    const recipe = new Recipe({
      title: 'Recipe with Comment',
      steps: ['Step 1'],
      ingredients: ['Ingredient 1'],
    });

    await recipe.save();

    recipe.comments.push({
      userId: userId,
      text: 'This is a test comment'
    });

    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id);
    expect(updatedRecipe.comments).toHaveLength(1);
    expect(updatedRecipe.comments[0].text).toBe('This is a test comment');
    expect(updatedRecipe.comments[0].userId.toString()).toBe(userId.toString());
  });

  it('should add a rating to a recipe', async () => {
    const userId = new mongoose.Types.ObjectId();

    const recipe = new Recipe({
      title: 'Recipe with Rating',
      steps: ['Step 1'],
      ingredients: ['Ingredient 1'],
    });

    await recipe.save();

    recipe.ratings.push({
      userId: userId,
      value: 4
    });

    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id);
    expect(updatedRecipe.ratings).toHaveLength(1);
    expect(updatedRecipe.ratings[0].value).toBe(4);
  });
});
