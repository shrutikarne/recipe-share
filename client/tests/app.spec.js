import { test, expect } from "@playwright/test";

test.describe("App smoke test", () => {
  test("Home page renders core sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('body')).toBeVisible();
    // Check for one of the hero/section headings present on Home
    const options = [
      page.getByRole('heading', { name: /explore by mood/i }),
      page.getByRole('heading', { name: /trending|featured/i })
    ];
    let seen = false;
    for (const loc of options) {
      if (await loc.count()) { seen = true; break; }
    }
    expect(seen).toBeTruthy();
  });
});
