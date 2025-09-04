const { verifyToken } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const mongoose = require("mongoose");

// Mock jwt module
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 401 if no auth header", () => {
    const req = { cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "No token found, authorization denied"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token format", () => {
    const req = { cookies: { token: "InvalidFormat" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Setup jwt.verify to throw an error
    const error = new Error("jwt malformed");
    error.name = "JsonWebTokenError";  // This will make it hit the correct case
    jwt.verify.mockImplementation(() => {
      throw error;
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Invalid token"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for missing token", () => {
    const req = { cookies: { token: "" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "No token found, authorization denied"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() for valid token", () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const req = { cookies: { token: "valid.token" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Mock the verify method to return a valid decoded token
    jwt.verify.mockReturnValue({
      user: { id: userId }
    });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid.token", config.JWT_SECRET);
    expect(req.user).toEqual({ id: userId });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 for expired token", () => {
    const req = { cookies: { token: "expired.token" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Mock the verify method to throw a TokenExpiredError
    const error = new Error("jwt expired");
    error.name = "TokenExpiredError";
    jwt.verify.mockImplementation(() => { throw error; });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Token has expired",
      expired: true
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid token", () => {
    const req = { cookies: { token: "invalid.token" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Mock the verify method to throw a JsonWebTokenError
    const error = new Error("invalid token");
    error.name = "JsonWebTokenError";
    jwt.verify.mockImplementation(() => { throw error; });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Invalid token"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for token with invalid payload format", () => {
    const req = { cookies: { token: "malformed.token" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Mock the verify method to return a token without proper user payload
    jwt.verify.mockReturnValue({ notUser: "invalid payload" });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Invalid token format"
    });
    expect(next).not.toHaveBeenCalled();
  });
});
