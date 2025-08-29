const request = require("supertest");
const mongoose = require('mongoose');
const app = require("../server");
const Recipe = require('../models/Recipe');
const { 
  connectDB, 
  closeDB, 
  clearDatabase, 
  createTestUser, 
  createTestRecipe, 
  authHeader 
} = require('./helpers');

describe("Recipe API", () => {
  let testUser, authToken, testRecipe;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test user for authentication
    const userData = await createTestUser();
    testUser = userData.user;
    authToken = userData.token;
    
    // Create a test recipe
    testRecipe = await createTestRecipe(testUser._id);
  });

  describe("GET /api/recipes", () => {
    it("should get all recipes", async () => {
      const res = await request(app).get("/api/recipes");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get recipes with pagination", async () => {
      // Create 5 more recipes
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(createTestRecipe(testUser._id, { title: `Pagination Recipe ${i}` }));
      }
      await Promise.all(promises);
      
      // Get first page with 3 items
      const res1 = await request(app).get("/api/recipes?limit=3&skip=0");
      expect(res1.statusCode).toBe(200);
      expect(res1.body.length).toBe(3);
      
      // Get second page
      const res2 = await request(app).get("/api/recipes?limit=3&skip=3");
      expect(res2.statusCode).toBe(200);
      expect(res2.body.length).toBeGreaterThan(0);
      
      // Make sure pages have different recipes
      const firstPageIds = res1.body.map(recipe => recipe._id);
      const secondPageIds = res2.body.map(recipe => recipe._id);
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      expect(overlap.length).toBe(0);
    });
    
    it("should filter recipes by category", async () => {
      // Create recipe with specific category
      await createTestRecipe(testUser._id, { category: "Italian" });
      
      const res = await request(app).get("/api/recipes?category=Italian");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every(recipe => recipe.category === "Italian")).toBe(true);
    });
    
    it("should filter recipes by search term", async () => {
      // Create recipe with unique title
      await createTestRecipe(testUser._id, { title: "UniqueSearchTerm Recipe" });
      
      const res = await request(app).get("/api/recipes?search=UniqueSearchTerm");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toContain("UniqueSearchTerm");
    });
  });
  
  describe("GET /api/recipes/:id", () => {
    it("should get a recipe by ID", async () => {
      const res = await request(app).get(`/api/recipes/${testRecipe._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(testRecipe._id.toString());
      expect(res.body.title).toBe(testRecipe.title);
    });
    
    it("should return 404 for non-existent recipe", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/recipes/${nonExistentId}`);
      expect(res.statusCode).toBe(404);
    });
    
    it("should return 400 for invalid recipe ID", async () => {
      const res = await request(app).get('/api/recipes/invalid-id');
      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /api/recipes", () => {
    it("should not create recipe without auth", async () => {
      const res = await request(app)
        .post("/api/recipes")
        .send({ title: "Test", description: "desc" });
      expect(res.statusCode).toBe(401);
    });
    
    it("should create a new recipe with valid auth", async () => {
      const newRecipe = {
        title: "New API Test Recipe",
        description: "A recipe created via API test",
        ingredients: ["Ingredient 1", "Ingredient 2"],
        steps: ["Step 1", "Step 2"],
        category: "Testing"
      };
      
      const res = await request(app)
        .post("/api/recipes")
        .set(authHeader(authToken))
        .send(newRecipe);
      
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBeDefined();
      expect(res.body.title).toBe(newRecipe.title);
      expect(res.body.author).toBe(testUser._id.toString());
      
      // Verify recipe exists in database
      const savedRecipe = await Recipe.findById(res.body._id);
      expect(savedRecipe).toBeDefined();
      expect(savedRecipe.title).toBe(newRecipe.title);
    });
    
    it("should not create recipe without required fields", async () => {
      const res = await request(app)
        .post("/api/recipes")
        .set(authHeader(authToken))
        .send({ description: "Missing required fields" });
      
      expect(res.statusCode).toBe(400);
    });
  });
  
  describe("PUT /api/recipes/:id", () => {
    it("should update a recipe with valid auth", async () => {
      const updates = {
        title: "Updated Recipe Title",
        description: "Updated description"
      };
      
      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}`)
        .set(authHeader(authToken))
        .send(updates);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe(updates.title);
      expect(res.body.description).toBe(updates.description);
      
      // Verify recipe was updated in database
      const updatedRecipe = await Recipe.findById(testRecipe._id);
      expect(updatedRecipe.title).toBe(updates.title);
    });
    
    it("should not update a recipe without auth", async () => {
      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}`)
        .send({ title: "Unauthorized Update" });
      
      expect(res.statusCode).toBe(401);
      
      // Verify recipe was not changed
      const unchangedRecipe = await Recipe.findById(testRecipe._id);
      expect(unchangedRecipe.title).toBe(testRecipe.title);
    });
    
    it("should not allow updating a recipe that doesn't belong to the user", async () => {
      // Create another user
      const otherUser = await createTestUser({
        email: "other@example.com"
      });
      
      // Try to update as different user
      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}`)
        .set(authHeader(otherUser.token))
        .send({ title: "Unauthorized Update" });
      
      expect(res.statusCode).toBe(403);
    });
  });
  
  describe("DELETE /api/recipes/:id", () => {
    it("should delete a recipe with valid auth", async () => {
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}`)
        .set(authHeader(authToken));
      
      expect(res.statusCode).toBe(200);
      
      // Verify recipe was deleted
      const deletedRecipe = await Recipe.findById(testRecipe._id);
      expect(deletedRecipe).toBeNull();
    });
    
    it("should not delete a recipe without auth", async () => {
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}`);
      
      expect(res.statusCode).toBe(401);
      
      // Verify recipe still exists
      const recipe = await Recipe.findById(testRecipe._id);
      expect(recipe).toBeDefined();
    });
  });
  
  describe("Random Recipe", () => {
    it("should get a random recipe", async () => {
      const res = await request(app).get("/api/recipes/random");
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBeDefined();
    });
  });
  
  describe("Recipe Count", () => {
    it("should get the total count of recipes", async () => {
      const res = await request(app).get("/api/recipes/count");
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeDefined();
      expect(res.body.count).toBeGreaterThan(0);
    });
    
    it("should get filtered count of recipes", async () => {
      await createTestRecipe(testUser._id, { category: "CountTest" });
      
      const res = await request(app).get("/api/recipes/count?category=CountTest");
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeDefined();
      expect(res.body.count).toBe(1);
    });
  });
});
