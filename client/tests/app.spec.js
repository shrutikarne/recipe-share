import { test, expect } from "@playwright/test";

test.describe("App smoke test", () => {
  test("Home page loads and displays recipes", async ({ page }) => {
    await page.goto("/");
    // Check for the main heading
    await expect(
      page.getByRole("heading", { name: /All Recipes/i })
    ).toBeVisible();
    // Check for navigation links
    await expect(page.getByRole("link", { name: /Home page/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Add a new recipe|Login or Register/i })
    ).toBeVisible();
  });
});
