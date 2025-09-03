import { test, expect } from '@playwright/test';

// Playwright test for CategoryTiles component

test.describe('CategoryTiles Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Adjust if CategoryTiles is on a different route
  });

  test('should display all category tiles', async ({ page }) => {
    const categories = [
      'Quick & Easy',
      'Comfort Food',
      'Healthy',
      'Sweet Tooth',
      'Date Night',
      'Breakfast',
      'Party Mood',
      'Kid-Friendly',
    ];
    for (const label of categories) {
            await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('should be clickable and stay on home', async ({ page }) => {
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
    // Wait a moment for DOM to update
    await page.waitForTimeout(200);
    // Double-check overlay is hidden
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
    const urlBefore = page.url();
    await page.getByRole('button', { name: 'Comfort Food' }).click();
    await expect(page).toHaveURL(urlBefore);
  });
});
