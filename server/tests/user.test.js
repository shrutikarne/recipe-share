const request = require("supertest");
const mongoose = require('mongoose');
const app = require("../server");
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const {
  connectDB,
  closeDB,
  clearDatabase,
  createTestUser,
  createTestRecipe,
  authHeader
} = require('./helpers');

describe("User API", () => {
  let testUser, authToken, testRecipe;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test user
    const userData = await createTestUser();
    testUser = userData.user;
    authToken = userData.token;
    
    // Create a test recipe
    testRecipe = await createTestRecipe(testUser._id);
  });
  
  describe("GET /api/user/profile", () => {
    it("should get user profile when authenticated", async () => {
      const res = await request(app)
        .get("/api/user/profile")
        .set(authHeader(authToken));
      
      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(testUser._id.toString());
      expect(res.body.name).toBe(testUser.name);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.password).toBeUndefined(); // Password should not be returned
      expect(res.body.stats).toBeDefined();
    });
    
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/user/profile");
      expect(res.statusCode).toBe(401);
    });
  });
  
  describe("PUT /api/user/profile", () => {
    it("should update user profile when authenticated", async () => {
      const updates = {
        name: "Updated Name",
        avatar: "https://example.com/new-avatar.jpg"
      };
      
      const res = await request(app)
        .put("/api/user/profile")
        .set(authHeader(authToken))
        .send(updates);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(updates.name);
      expect(res.body.avatar).toBe(updates.avatar);
      
      // Verify database was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.name).toBe(updates.name);
    });
    
    it("should return 401 when not authenticated", async () => {
      const res = await request(app)
        .put("/api/user/profile")
        .send({ name: "Unauthorized Update" });
      
      expect(res.statusCode).toBe(401);
    });
    
    it("should reject invalid data", async () => {
      // Name too short (assuming min length is 2)
      const res = await request(app)
        .put("/api/user/profile")
        .set(authHeader(authToken))
        .send({ name: "A" });
      
      expect(res.statusCode).toBe(400);
    });
  });
  
  describe("GET /api/user/recipes", () => {
    it("should get user's recipes when authenticated", async () => {
      const res = await request(app)
        .get("/api/user/recipes")
        .set(authHeader(authToken));
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toBe(testRecipe.title);
    });
    
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/user/recipes");
      expect(res.statusCode).toBe(401);
    });
  });
  
  describe("Saved Recipes", () => {
    it("should save a recipe when authenticated", async () => {
      const res = await request(app)
        .post(`/api/user/save/${testRecipe._id}`)
        .set(authHeader(authToken))
        .send({ collection: "Favorites" });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.saved).toBe(true);
      
      // Verify recipe was saved
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.savedRecipes.length).toBe(1);
      expect(updatedUser.savedRecipes[0].recipe.toString()).toBe(testRecipe._id.toString());
      expect(updatedUser.savedRecipes[0].collection).toBe("Favorites");
    });
    
    it("should unsave a recipe when authenticated", async () => {
      // First save the recipe
      await User.findByIdAndUpdate(testUser._id, {
        $push: {
          savedRecipes: {
            recipe: testRecipe._id,
            collection: "Favorites"
          }
        }
      });
      
      const res = await request(app)
        .post(`/api/user/unsave/${testRecipe._id}`)
        .set(authHeader(authToken));
      
      expect(res.statusCode).toBe(200);
      expect(res.body.saved).toBe(false);
      
      // Verify recipe was unsaved
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.savedRecipes.length).toBe(0);
    });
    
    it("should get saved recipes when authenticated", async () => {
      // First save the recipe
      await User.findByIdAndUpdate(testUser._id, {
        $push: {
          savedRecipes: {
            recipe: testRecipe._id,
            collection: "Favorites"
          }
        }
      });
      
      const res = await request(app)
        .get("/api/user/saved")
        .set(authHeader(authToken));
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].recipe._id.toString()).toBe(testRecipe._id.toString());
      expect(res.body[0].collection).toBe("Favorites");
    });
  });
});
