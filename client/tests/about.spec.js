import { test, expect } from "@playwright/test";

test.describe("About Page", () => {
  test("should display about content and explore button", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /about me/i })).toBeVisible();
    await expect(page.getByText(/cooking, to me, is more than just recipes/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /explore|start exploring/i })).toBeVisible();
  });
});
