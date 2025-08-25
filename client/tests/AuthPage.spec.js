import { test, expect } from "@playwright/test";

test.describe("AuthPage", () => {
  test("shows login or register form", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("text=/login|register/i")).toBeVisible();
  });
});
