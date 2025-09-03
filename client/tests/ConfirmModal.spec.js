import { test, expect } from '@playwright/test';
import { bootstrapAuth } from './helpers';

// ConfirmModal is shown when clicking Logout in the navbar (authenticated)
test.describe('ConfirmModal Component', () => {
  test('opens on logout and closes via Cancel', async ({ page, request }) => {
    await bootstrapAuth(page, request);
    await page.goto('/profile');
    await page.locator('.navbar-glass__avatar-btn').click();
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
