import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("shows recipe cards when available and navigates to detail", async ({ page }) => {
    await page.goto("/");
    const count = await page.locator('.recipe-card').count();
    if (count === 0) test.skip();
    await page.locator('.recipe-card').first().click();
    await expect(page).toHaveURL(/\/recipe\//);
  });
});
