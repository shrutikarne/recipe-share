const request = require("supertest");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require("../server");
const User = require("../models/User");
const config = require("../config/config");
const { connectDB, closeDB, clearDatabase, authHeader } = require('./helpers');

describe("Auth API", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Login", () => {
    it("should not login with invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "fake@example.com", password: "wrong" });
      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe("Invalid credentials");
    });

    it("should login with valid credentials", async () => {
      // Create a test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);

      await User.create({
        name: "Test User",
        email: "valid@example.com",
        password: hashedPassword
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "valid@example.com", password: "password123" });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();

      // Verify token has correct user ID
      const decodedToken = jwt.verify(res.body.token, config.JWT_SECRET);
      expect(decodedToken.user).toBeDefined();
      expect(decodedToken.user.id).toBeDefined();
    });

    it("should reject login with invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "not-an-email", password: "password123" });

      expect(res.statusCode).toBe(400);
    });

    it("should handle rate limiting", async () => {
      // Make 6 rapid requests (assuming limit is 5)
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post("/api/auth/login")
            .send({ email: `test${i}@example.com`, password: "password" })
        );
      }

      const results = await Promise.all(promises);

      // At least one request should be rate limited
      const rateLimited = results.some(res => res.statusCode === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe("Registration", () => {
    it("should not register with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" });
      expect(res.statusCode).toBe(400);
    });

    it("should register with valid data", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "New User",
          email: "new@example.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ email: "new@example.com" });
      expect(user).toBeDefined();
      expect(user.name).toBe("New User");

      // Password should be hashed
      expect(user.password).not.toBe("password123");
    });

    it("should not allow duplicate email registration", async () => {
      // Create first user
      await User.create({
        name: "Original User",
        email: "duplicate@example.com",
        password: "hashedpassword123"
      });

      // Try to register with same email
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: "duplicate@example.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("User already exists");
    });
  });

  describe("Token Refresh", () => {
    it("should refresh token for authenticated user", async () => {
      // Create a user
      const user = await User.create({
        name: "Refresh User",
        email: "refresh@example.com",
        password: "hashedpassword123"
      });

      // Create a token
      const token = jwt.sign(
        { user: { id: user._id } },
        config.JWT_SECRET,
        { expiresIn: '30m' }
      );

      // Try to refresh the token
      const res = await request(app)
        .post("/api/auth/refresh")
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.token).not.toBe(token); // New token should be different

      // Verify new token
      const decodedToken = jwt.verify(res.body.token, config.JWT_SECRET);
      expect(decodedToken.user.id).toBe(user._id.toString());
    });

    it("should reject refresh with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set(authHeader("invalid.token.here"));

      expect(res.statusCode).toBe(401);
    });

    it("should reject refresh with missing token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh");

      expect(res.statusCode).toBe(401);
    });
  });
});
