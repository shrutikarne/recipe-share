import { test, expect } from '@playwright/test';
import { bootstrapAuth } from './helpers';

test.describe('PrivateRoute Component', () => {
  test('should redirect unauthenticated users', async ({ page }) => {
    // Go to a protected route
    await page.goto('/profile'); // Adjust to a protected route
    // Check for redirect (e.g., to login page)
    await expect(page).toHaveURL(/login/);
  });

  test('should allow access for authenticated users', async ({ page, request }) => {
    await bootstrapAuth(page, request);
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);
    // Optionally assert on something within the profile page
    // await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });
});
