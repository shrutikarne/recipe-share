import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should switch between login and register tabs with keyboard", async ({
    page,
  }) => {
    await page.goto("/login");
    // Check login tab and form
    await expect(page.getByRole("tab", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("tabpanel", { name: /login/i })).toBeVisible();
    // Switch to register tab
    await page.getByRole("tab", { name: /register/i }).focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("tabpanel", { name: /register/i })
    ).toBeVisible();
  });
});
