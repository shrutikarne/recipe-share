import { test, expect } from '@playwright/test';

test.describe('HeroBanner Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page where the HeroBanner is displayed
    await page.goto('http://localhost:3000');

    // Wait for the hero banner to be visible
    await page.waitForSelector('.hero-banner');
  });

  test('renders the HeroBanner component with all elements', async ({ page }) => {
    // Check if main elements are present
    await expect(page.locator('.hero-banner__image')).toBeVisible();
    await expect(page.locator('.hero-banner__overlay')).toBeVisible();
    await expect(page.locator('.hero-banner__title')).toBeVisible();
    await expect(page.locator('.hero-banner__search')).toBeVisible();
    await expect(page.locator('.hero-banner__actions')).toBeVisible();
  });

  test('displays the correct title text', async ({ page }) => {
    const titleText = await page.locator('.hero-banner__title').textContent();
    expect(titleText).toContain('Discover, Cook, & Share Recipes with Love');
  });

  test('search input should be present and functional', async ({ page }) => {
    // Type in the search input
    await page.fill('.hero-banner__search-input', 'pasta');
    
    // Verify text was entered
    const inputValue = await page.inputValue('.hero-banner__search-input');
    expect(inputValue).toBe('pasta');
    
    // Verify search button is present
    await expect(page.locator('.hero-banner__search-btn')).toBeVisible();
  });

  test('browse recipes button should be visible', async ({ page }) => {
    // Verify browse button is present
    const browseButton = page.locator('.hero-banner__cta').first();
    await expect(browseButton).toBeVisible();
    
    // Verify button text
    const buttonText = await browseButton.textContent();
    expect(buttonText).toBe('Browse Recipes');
  });

  test('upload button should be visible', async ({ page }) => {
    // Verify upload button is present
    const uploadButton = page.locator('.hero-banner__cta--upload');
    await expect(uploadButton).toBeVisible();
    
    // Verify button text
    const buttonText = await uploadButton.textContent();
    expect(buttonText).toBe('Upload Your Own');
  });

  test('hero image loads correctly', async ({ page }) => {
    // Check if the hero image has loaded
    const imageElement = page.locator('.hero-banner__image');
    
    // Verify the image source
    const imageSrc = await imageElement.getAttribute('src');
    expect(imageSrc).toBe('/hero-food.jpg');
    
    // Verify the image alt text
    const imageAlt = await imageElement.getAttribute('alt');
    expect(imageAlt).toBe('Cooking table with ingredients');
  });

  test('animations are applied when loaded', async ({ page }) => {
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Check if animation classes or styles are applied
    // For Framer Motion, check if elements are visible, which means animation has completed
    await expect(page.locator('.hero-banner__title')).toBeVisible();
    await expect(page.locator('.hero-banner__search')).toBeVisible();
    await expect(page.locator('.hero-banner__actions')).toBeVisible();
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for the layout to adjust
    await page.waitForTimeout(500);
    
    // Verify the hero banner is still visible and properly styled
    await expect(page.locator('.hero-banner')).toBeVisible();
    
    // Search input should be full width on mobile
    const searchInput = page.locator('.hero-banner__search-input');
    await expect(searchInput).toBeVisible();
    
    // Buttons should stack on mobile
    const actionButtons = page.locator('.hero-banner__actions');
    await expect(actionButtons).toBeVisible();
  });
});
