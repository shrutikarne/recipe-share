const request = require("supertest");
const app = require("../server");

describe("Auth API", () => {
  it("should not login with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "fake@example.com", password: "wrong" });
    expect(res.statusCode).toBe(401);
  });

  it("should not register with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" });
    expect(res.statusCode).toBe(400);
  });
});
