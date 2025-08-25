const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");

describe("Recipe Model", () => {
  it("should require a title", async () => {
    const recipe = new Recipe({ description: "desc" });
    let err;
    try {
      await recipe.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors && err.errors.title).toBeDefined();
  });

  it("should save a valid recipe", async () => {
    const recipe = new Recipe({
      title: "Test",
      description: "desc",
      ingredients: ["a"],
      steps: ["b"],
    });
    let err;
    try {
      await recipe.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeUndefined();
  });
});
