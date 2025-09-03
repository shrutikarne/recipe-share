import { test, expect } from "@playwright/test";

test.describe("RecipeQuickPreviewModal", () => {
  test.skip("No direct trigger on Home; skipping until wired", async ({ page }) => {
    await page.goto("/");
  });
});
