const { test, expect } = require('@playwright/test');

test.describe('Recipe Creation Flow', () => {
  let authToken;

  test.beforeEach(async ({ page }) => {
    // Login before testing recipe creation
    await page.goto('/auth?mode=login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for login to complete and check redirect to home page
    await expect(page).toHaveURL('/');

    // Get auth token from localStorage for later requests
    authToken = await page.evaluate(() => localStorage.getItem('authToken'));
  });

  test('should allow authenticated users to create a new recipe', async ({ page }) => {
    // Navigate to the add recipe page
    await page.goto('/add-recipe');
    await expect(page).toHaveURL('/add-recipe');
    await expect(page.getByRole('heading', { name: 'Create New Recipe' })).toBeVisible();

    // Fill in the basic recipe information
    await page.fill('[name="title"]', 'Test Chocolate Cake');
    await page.fill('[name="description"]', 'A delicious chocolate cake recipe for testing.');
    await page.selectOption('select[name="difficulty"]', 'Medium');
    await page.selectOption('select[name="cuisine"]', 'Dessert');
    await page.fill('[name="servings"]', '8');

    // Fill in time information
    await page.fill('[name="prepHours"]', '0');
    await page.fill('[name="prepMinutes"]', '30');
    await page.fill('[name="cookHours"]', '1');
    await page.fill('[name="cookMinutes"]', '15');

    // Add ingredients
    await page.click('button:has-text("Add Ingredient")');
    await page.fill('[name="ingredients.0.name"]', 'All-purpose flour');
    await page.fill('[name="ingredients.0.quantity"]', '2');
    await page.fill('[name="ingredients.0.unit"]', 'cups');

    await page.click('button:has-text("Add Ingredient")');
    await page.fill('[name="ingredients.1.name"]', 'Granulated sugar');
    await page.fill('[name="ingredients.1.quantity"]', '1.5');
    await page.fill('[name="ingredients.1.unit"]', 'cups');

    await page.click('button:has-text("Add Ingredient")');
    await page.fill('[name="ingredients.2.name"]', 'Cocoa powder');
    await page.fill('[name="ingredients.2.quantity"]', '0.75');
    await page.fill('[name="ingredients.2.unit"]', 'cup');

    // Add instructions
    await page.click('button:has-text("Add Step")');
    await page.fill('[name="instructions.0"]', 'Preheat the oven to 350°F (175°C) and grease two 9-inch cake pans.');

    await page.click('button:has-text("Add Step")');
    await page.fill('[name="instructions.1"]', 'In a large bowl, mix the dry ingredients: flour, sugar, and cocoa powder.');

    await page.click('button:has-text("Add Step")');
    await page.fill('[name="instructions.2"]', 'Bake for approximately 30-35 minutes or until a toothpick inserted comes out clean.');

    // Upload mock image (note: in a real test you'd need a file to upload)
    // This part would require setting up a proper file for upload
    // await page.setInputFiles('input[type="file"]', 'path/to/test/image.jpg');

    // Add tags
    await page.fill('[name="tags"]', 'chocolate, cake, dessert, baking');

    // Select categories
    await page.check('input[name="categories"][value="Desserts"]');
    await page.check('input[name="categories"][value="Baked Goods"]');

    // Add nutrition info
    await page.click('button:has-text("Add Nutrition Info")');
    await page.fill('[name="nutrition.calories"]', '350');
    await page.fill('[name="nutrition.protein"]', '5');
    await page.fill('[name="nutrition.carbohydrates"]', '50');
    await page.fill('[name="nutrition.fat"]', '15');

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify redirect to recipe detail page
    await expect(page.url()).toContain('/recipe/');
    await expect(page.getByText('Test Chocolate Cake')).toBeVisible();
    await expect(page.getByText('A delicious chocolate cake recipe for testing.')).toBeVisible();

    // Verify recipe details are displayed
    await expect(page.getByText('Medium')).toBeVisible();
    await expect(page.getByText('Dessert')).toBeVisible();
    await expect(page.getByText('8 servings')).toBeVisible();

    // Verify ingredients are displayed
    await expect(page.getByText('All-purpose flour')).toBeVisible();
    await expect(page.getByText('Granulated sugar')).toBeVisible();
    await expect(page.getByText('Cocoa powder')).toBeVisible();

    // Verify instructions are displayed
    await expect(page.getByText('Preheat the oven to 350°F')).toBeVisible();
    await expect(page.getByText('In a large bowl, mix the dry ingredients')).toBeVisible();

    // Verify tags are displayed
    await expect(page.getByText('chocolate')).toBeVisible();
    await expect(page.getByText('cake')).toBeVisible();
    await expect(page.getByText('dessert')).toBeVisible();
    await expect(page.getByText('baking')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Navigate to the add recipe page
    await page.goto('/add-recipe');

    // Try to submit the form without filling required fields
    await page.click('button[type="submit"]');

    // Check for validation error messages
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
    await expect(page.getByText('At least one ingredient is required')).toBeVisible();
    await expect(page.getByText('At least one instruction step is required')).toBeVisible();
  });

  test('should allow users to preview their recipe before submission', async ({ page }) => {
    // Navigate to the add recipe page
    await page.goto('/add-recipe');

    // Fill in basic recipe details
    await page.fill('[name="title"]', 'Preview Test Recipe');
    await page.fill('[name="description"]', 'Testing the preview functionality.');
    await page.selectOption('select[name="difficulty"]', 'Easy');

    // Add an ingredient
    await page.click('button:has-text("Add Ingredient")');
    await page.fill('[name="ingredients.0.name"]', 'Test Ingredient');
    await page.fill('[name="ingredients.0.quantity"]', '1');
    await page.fill('[name="ingredients.0.unit"]', 'cup');

    // Add an instruction
    await page.click('button:has-text("Add Step")');
    await page.fill('[name="instructions.0"]', 'Test instruction step.');

    // Click the preview button
    await page.click('button:has-text("Preview Recipe")');

    // Verify the preview contains the entered information
    await expect(page.getByText('Preview Test Recipe')).toBeVisible();
    await expect(page.getByText('Testing the preview functionality.')).toBeVisible();
    await expect(page.getByText('Test Ingredient')).toBeVisible();
    await expect(page.getByText('Test instruction step.')).toBeVisible();

    // Return to edit mode
    await page.click('button:has-text("Continue Editing")');

    // Verify we're back in edit mode
    await expect(page.getByLabel('Title')).toHaveValue('Preview Test Recipe');
  });
});
