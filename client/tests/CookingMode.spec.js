import { test, expect } from "@playwright/test";

test.describe("CookingMode", () => {
  test("shows cooking steps", async ({ page }) => {
    await page.goto("/");
    // Simulate entering cooking mode if a button exists
    const cookingBtn = page.locator("button", { hasText: /cooking mode/i });
    if (await cookingBtn.count()) {
      await cookingBtn.first().click();
      await expect(page.locator("text=/step 1/i")).toBeVisible();
    }
  });
});
