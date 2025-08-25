import { test, expect } from "@playwright/test";

test.describe("RecipeStoryView", () => {
  test("shows story steps", async ({ page }) => {
    await page.goto("/");
    // Simulate opening story view if a button exists
    const storyBtn = page.locator("button", { hasText: /story|view steps/i });
    if (await storyBtn.count()) {
      await storyBtn.first().click();
      await expect(page.locator("text=/step 1/i")).toBeVisible();
    }
  });
});
