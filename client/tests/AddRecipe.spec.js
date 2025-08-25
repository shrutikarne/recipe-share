import { test, expect } from "@playwright/test";

test.describe("AddRecipe page", () => {
  test("shows add recipe form", async ({ page }) => {
    await page.goto("/add");
    // Check for the Add Recipe heading
    await expect(
      page.getByRole("heading", { name: /Add Recipe/i })
    ).toBeVisible();
    // Check for the Add Recipe button
    await expect(
      page.getByRole("button", { name: /Add recipe/i })
    ).toBeVisible();
  });
});
