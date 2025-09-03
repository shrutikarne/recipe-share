import { test, expect } from "@playwright/test";

test.describe("AuthPage", () => {
  test("shows login or register form", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole('tab', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /register/i })).toBeVisible();
  });
});
