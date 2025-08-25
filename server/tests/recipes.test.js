const request = require("supertest");
const app = require("../server");

describe("Recipe API", () => {
  it("should get all recipes", async () => {
    const res = await request(app).get("/api/recipes");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should not create recipe without auth", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .send({ title: "Test", description: "desc" });
    expect(res.statusCode).toBe(401);
  });
});
