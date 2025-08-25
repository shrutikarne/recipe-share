const { verifyToken } = require("../middleware/auth");

describe("Auth Middleware", () => {
  it("should return 401 if no token", () => {
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: "No token, authorization denied",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
