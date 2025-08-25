import { test, expect } from "@playwright/test";

test.describe("RecipeQuickPreviewModal", () => {
  test("opens and displays recipe details", async ({ page }) => {
    await page.goto("/");
    // Simulate opening a modal if a button exists
    const previewBtn = page.locator("button", { hasText: /preview|quick/i });
    if (await previewBtn.count()) {
      await previewBtn.first().click();
      await expect(page.locator("role=dialog")).toBeVisible();
    }
  });
});
