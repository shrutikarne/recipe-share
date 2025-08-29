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
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Authorization header missing"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for invalid auth header format", () => {
    const req = { header: jest.fn().mockReturnValue("InvalidFormat") };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Invalid authorization format. Use 'Bearer [token]'"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 for missing token", () => {
    const req = { header: jest.fn().mockReturnValue("Bearer ") };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "No token provided, authorization denied"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() for valid token", () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const req = { header: jest.fn().mockReturnValue("Bearer valid.token") };
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
    const req = { header: jest.fn().mockReturnValue("Bearer expired.token") };
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
    const req = { header: jest.fn().mockReturnValue("Bearer invalid.token") };
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
    const req = { header: jest.fn().mockReturnValue("Bearer malformed.token") };
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
