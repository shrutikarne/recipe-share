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

describe("Recipe Comments API", () => {
  let testUser, authToken, testRecipe, testUser2, authToken2;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create two test users
    const userData1 = await createTestUser();
    testUser = userData1.user;
    authToken = userData1.token;

    const userData2 = await createTestUser({
      name: 'Second User',
      email: 'second@example.com',
      password: 'Password123!'
    });
    testUser2 = userData2.user;
    authToken2 = userData2.token;

    // Create a test recipe
    testRecipe = await createTestRecipe(testUser._id);
  });

  describe("POST /api/recipes/:recipeId/comments", () => {
    it("should add a comment to a recipe", async () => {
      const commentData = {
        text: "This recipe is amazing!",
        rating: 5
      };

      const res = await request(app)
        .post(`/api/recipes/${testRecipe._id}/comments`)
        .set(authHeader(authToken))
        .send(commentData);

      expect(res.statusCode).toBe(201);
      expect(res.body.comments).toBeDefined();
      expect(res.body.comments.length).toBe(1);
      expect(res.body.comments[0].text).toBe(commentData.text);
      expect(res.body.comments[0].rating).toBe(commentData.rating);
      expect(res.body.comments[0].user._id.toString()).toBe(testUser._id.toString());
      expect(res.body.comments[0].user.name).toBe(testUser.name);

      // Check the average rating was updated
      expect(res.body.averageRating).toBeDefined();
      expect(res.body.averageRating).toBe(commentData.rating);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app)
        .post(`/api/recipes/${testRecipe._id}/comments`)
        .send({ text: "Unauthorized comment", rating: 4 });

      expect(res.statusCode).toBe(401);
    });

    it("should return 400 if comment text is missing", async () => {
      const res = await request(app)
        .post(`/api/recipes/${testRecipe._id}/comments`)
        .set(authHeader(authToken))
        .send({ rating: 3 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("should return 400 if rating is outside valid range", async () => {
      const invalidRatings = [-1, 0, 6, 10]; // Assuming valid range is 1-5

      for (const rating of invalidRatings) {
        const res = await request(app)
          .post(`/api/recipes/${testRecipe._id}/comments`)
          .set(authHeader(authToken))
          .send({
            text: "Testing invalid rating",
            rating
          });

        expect(res.statusCode).toBe(400);
      }
    });

    it("should update the average rating correctly", async () => {
      // First comment
      await request(app)
        .post(`/api/recipes/${testRecipe._id}/comments`)
        .set(authHeader(authToken))
        .send({
          text: "First comment",
          rating: 5
        });

      // Second comment from a different user
      const res = await request(app)
        .post(`/api/recipes/${testRecipe._id}/comments`)
        .set(authHeader(authToken2))
        .send({
          text: "Second comment",
          rating: 3
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.comments.length).toBe(2);
      // Average rating should be (5+3)/2 = 4
      expect(res.body.averageRating).toBe(4);
    });
  });

  describe("GET /api/recipes/:recipeId/comments", () => {
    beforeEach(async () => {
      // Add some comments to the recipe
      await Recipe.findByIdAndUpdate(
        testRecipe._id,
        {
          $push: {
            comments: [
              {
                user: testUser._id,
                text: "First test comment",
                rating: 5,
                createdAt: new Date()
              },
              {
                user: testUser2._id,
                text: "Second test comment",
                rating: 3,
                createdAt: new Date()
              }
            ]
          },
          $set: { averageRating: 4 }
        }
      );
    });

    it("should get all comments for a recipe", async () => {
      const res = await request(app)
        .get(`/api/recipes/${testRecipe._id}/comments`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].text).toBe("First test comment");
      expect(res.body[1].text).toBe("Second test comment");
    });

    it("should return user info with each comment", async () => {
      const res = await request(app)
        .get(`/api/recipes/${testRecipe._id}/comments`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0].user).toBeDefined();
      expect(res.body[0].user.name).toBe(testUser.name);
      expect(res.body[1].user).toBeDefined();
      expect(res.body[1].user.name).toBe(testUser2.name);
    });

    it("should return 404 for non-existent recipe", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${fakeId}/comments`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /api/recipes/:recipeId/comments/:commentId", () => {
    let commentId;

    beforeEach(async () => {
      // Add a comment to update
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        testRecipe._id,
        {
          $push: {
            comments: {
              user: testUser._id,
              text: "Comment to update",
              rating: 4
            }
          }
        },
        { new: true }
      );

      commentId = updatedRecipe.comments[0]._id;
    });

    it("should update a user's own comment", async () => {
      const updateData = {
        text: "Updated comment text",
        rating: 5
      };

      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}/comments/${commentId}`)
        .set(authHeader(authToken))
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.comments[0].text).toBe(updateData.text);
      expect(res.body.comments[0].rating).toBe(updateData.rating);
      expect(res.body.averageRating).toBe(updateData.rating);
    });

    it("should return 403 when trying to update another user's comment", async () => {
      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}/comments/${commentId}`)
        .set(authHeader(authToken2)) // Using the second user's token
        .send({ text: "Trying to modify someone else's comment", rating: 2 });

      expect(res.statusCode).toBe(403);
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}/comments/${fakeCommentId}`)
        .set(authHeader(authToken))
        .send({ text: "Update non-existent comment", rating: 3 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/recipes/:recipeId/comments/:commentId", () => {
    let commentId;

    beforeEach(async () => {
      // Add a comment to delete and also add the rating
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        testRecipe._id,
        {
          $push: {
            comments: {
              user: testUser._id,
              text: "Comment to delete",
              rating: 3
            },
            ratings: {
              userId: testUser._id,
              value: 3
            }
          },
          $set: { averageRating: 3 }
        },
        { new: true }
      );

      commentId = updatedRecipe.comments[0]._id;
    });

    it("should delete a user's own comment", async () => {
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}/comments/${commentId}`)
        .set(authHeader(authToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.comments.length).toBe(0);
      expect(res.body.averageRating).toBe(0); // No ratings left
    });

    it("should return 403 when trying to delete another user's comment", async () => {
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}/comments/${commentId}`)
        .set(authHeader(authToken2)); // Using the second user's token

      expect(res.statusCode).toBe(403);
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeCommentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}/comments/${fakeCommentId}`)
        .set(authHeader(authToken));

      expect(res.statusCode).toBe(404);
    });

    it("should properly recalculate average rating after comment deletion", async () => {
      // Add a second comment and also add the ratings
      await Recipe.findByIdAndUpdate(
        testRecipe._id,
        {
          $push: {
            comments: {
              user: testUser2._id,
              text: "Second comment",
              rating: 5
            },
            ratings: {
              userId: testUser2._id,
              value: 5
            }
          },
          $set: { averageRating: 4 } // (3+5)/2 = 4
        }
      );

      // Delete the first comment
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}/comments/${commentId}`)
        .set(authHeader(authToken));

      expect(res.statusCode).toBe(200);
      expect(res.body.comments.length).toBe(1);
      expect(res.body.averageRating).toBe(5); // Only the rating of 5 remains
    });
  });
});
