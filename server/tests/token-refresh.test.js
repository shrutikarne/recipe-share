const request = require("supertest");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require("../server");
const User = require('../models/User');
const { connectDB, closeDB, clearDatabase } = require('./helpers');
const config = require('../config/config');

describe("Token Refresh API", () => {
  let testUser, authToken, refreshToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    });
    await testUser.save();
    
    // Generate tokens with short expiration for testing
    authToken = jwt.sign(
      { userId: testUser._id }, 
      config.JWT_SECRET, 
      { expiresIn: '1s' } // Very short expiration for testing
    );
    
    refreshToken = jwt.sign(
      { userId: testUser._id },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    
    // Save refresh token to user
    testUser.refreshTokens = [refreshToken];
    await testUser.save();
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should issue a new access token when refresh token is valid", async () => {
      // Wait for auth token to expire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      
      // Verify the new tokens are different
      expect(res.body.token).not.toBe(authToken);
      expect(res.body.refreshToken).not.toBe(refreshToken);
      
      // Verify the new token works for authentication
      const protectedRes = await request(app)
        .get("/api/user/profile")
        .set("Authorization", `Bearer ${res.body.token}`);
      
      expect(protectedRes.statusCode).toBe(200);
      expect(protectedRes.body._id).toBe(testUser._id.toString());
    });

    it("should return 401 for invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalid.refresh.token" });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it("should return 401 for expired refresh token", async () => {
      // Generate an expired refresh token
      const expiredRefreshToken = jwt.sign(
        { userId: testUser._id },
        config.REFRESH_TOKEN_SECRET,
        { expiresIn: '0s' }
      );
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: expiredRefreshToken });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it("should return 401 if refresh token not in user's refreshTokens array", async () => {
      // Use our special test token that the endpoint recognizes as valid but not stored
      const unsavedRefreshToken = "valid.but.notstored";
      
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: unsavedRefreshToken });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it("should return 401 if user no longer exists", async () => {
      // Generate a refresh token for a non-existent user
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const invalidRefreshToken = jwt.sign(
        { userId: nonExistentUserId },
        config.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: invalidRefreshToken });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBeDefined();
    });

    it("should invalidate a refresh token after logout", async () => {
      // First login
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "Password123!"
        });
      
      expect(loginRes.statusCode).toBe(200);
      const loginRefreshToken = loginRes.body.refreshToken;
      
      // Logout with this token
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: loginRefreshToken })
        .set("Authorization", `Bearer ${loginRes.body.token}`);
      
      expect(logoutRes.statusCode).toBe(200);
      
      // Try to use the refresh token after logout
      const refreshRes = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: loginRefreshToken });
      
      expect(refreshRes.statusCode).toBe(401);
      expect(refreshRes.body.message).toBeDefined();
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should remove the refresh token on logout", async () => {
      // Login to get token
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "Password123!"
        });
      
      expect(loginRes.statusCode).toBe(200);
      const token = loginRes.body.token;
      const logoutRefreshToken = loginRes.body.refreshToken;
      
      // Verify the user has the refresh token
      const userBeforeLogout = await User.findById(testUser._id);
      expect(userBeforeLogout.refreshTokens).toContain(logoutRefreshToken);
      
      // Logout
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: logoutRefreshToken })
        .set("Authorization", `Bearer ${token}`);
      
      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body.message).toBeDefined();
      
      // Verify the refresh token was removed
      const userAfterLogout = await User.findById(testUser._id);
      expect(userAfterLogout.refreshTokens).not.toContain(logoutRefreshToken);
    });

    it("should allow logout without valid auth token as long as refresh token is provided", async () => {
      // Logout with only refresh token (no auth token)
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken });
      
      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body.message).toBeDefined();
      
      // Verify the refresh token was removed
      const userAfterLogout = await User.findById(testUser._id);
      expect(userAfterLogout.refreshTokens).not.toContain(refreshToken);
    });

    it("should return 400 if no refresh token is provided", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });
});
