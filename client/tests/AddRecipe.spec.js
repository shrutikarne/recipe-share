import { test, expect } from "@playwright/test";
import { bootstrapAuth } from './helpers';

test.describe("AddRecipe page", () => {
  // Mock the API endpoints needed for the add-recipe form
  test.beforeEach(async ({ page }) => {
    // Mock categories API
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { value: 'Dessert', label: 'Dessert' },
          { value: 'Main', label: 'Main' }
        ])
      });
    });
    
    // Mock diets API
    await page.route('**/api/diets', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'vegan', label: 'Vegan' }
        ])
      });
    });
    
    // Authenticate the user
    await bootstrapAuth(page);
  });
  
  test("shows add recipe form", async ({ page }) => {
    await page.goto("/add-recipe");
    
    // Remove the webpack overlay iframe if present
    await page.evaluate(() => {
      const overlay = document.getElementById('webpack-dev-server-client-overlay');
      if (overlay) overlay.style.display = 'none';
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe.id === 'webpack-dev-server-client-overlay') {
          iframe.style.display = 'none';
        }
      });
    });
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Look for essential form elements
    const title = page.locator('#title');
    await expect(title).toBeVisible({ timeout: 5000 });
    
    // Look for the first continue button
    const continueButton = page.getByRole("button", { name: /continue/i });
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    
    // Test passes if we can see the form elements
  });
});
