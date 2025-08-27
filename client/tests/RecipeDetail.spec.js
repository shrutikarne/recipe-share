import { test, expect } from "@playwright/test";

test.describe("RecipeDetail page", () => {
  test("shows recipe details", async ({ page }) => {
    // This test assumes at least one recipe exists. Fetch the first recipe id from the home page.
    await page.goto("/");
    const firstCard = page.locator(".recipe-card").first();
    const detailBtn = firstCard.locator("button, a, [role=button]");
    if ((await firstCard.count()) === 0) test.skip();
    await firstCard.click();
    // Try to open full details if possible
    if (await page.locator(".view-full-btn").count()) {
      await page.locator(".view-full-btn").click();
    }
    // Ensure at least one recipe exists by logging in and adding if needed
    await page.goto("/login");
    // Register and login user via API
    const apiRequest = await test.request.newContext();
    await apiRequest.post("http://localhost:5000/api/auth/register", {
      data: {
        name: "Test User",
        email: "testuser@example.com",
        password: "testpassword123",
      },
    });
    const loginResp = await apiRequest.post(
      "http://localhost:5000/api/auth/login",
      {
        data: { email: "testuser@example.com", password: "testpassword123" },
      }
    );
    const loginJson = await loginResp.json();
    const token = loginJson.token;
    // Set token in localStorage before navigating to /add
    await page.goto("/");
    await page.evaluate((token) => localStorage.setItem("token", token), token);
    await page.goto("/add-recipe");
    // Go to add-recipe and add a recipe
    await page.goto("/add-recipe");
    await page.fill("#title", "Test Recipe");
    await page.fill("#description", "A delicious test recipe");
    await page.fill("#ingredients", "flour,sugar,eggs");
    await page.fill("#steps", "mix,bake,serve");
    await page.selectOption("#category", "Dessert");
    await page.selectOption("#diet", "vegetarian");
    await page.fill("#cook-hours", "1");
    await page.fill("#cook-minutes", "30");
    await page.click('button[type="submit"]');
    // Wait for success or error message
    const successMsg = page.locator('.form-success, [role="alert"]', {
      hasText: "Recipe added",
    });
    const errorMsg = page.locator('.form-error, [role="alert"]');
    let added = false;
    try {
      await successMsg.waitFor({ timeout: 2000 });
      added = true;
    } catch { }
    if (!added) {
      if (await errorMsg.isVisible({ timeout: 500 })) {
        const msg = await errorMsg.textContent();
        if (/recipe added!?/i.test(msg)) {
          // Success, treat as added
        } else {
          throw new Error("Recipe creation failed: " + msg);
        }
      } else {
        const dom = await page.content();
        console.error("DOM after add-recipe submit:", dom);
        throw new Error(
          "Recipe creation did not show success or error message."
        );
      }
    }
    // Now go to home and open the first recipe
    await page.goto("/");
    await page.waitForTimeout(1000); // Give time for recipes to load
    const recipeCardToOpen = page.locator(".recipe-card").first();
    if ((await recipeCardToOpen.count()) === 0) {
      const dom = await page.content();
      console.error("DOM after loading home:", dom);
      throw new Error("No recipe cards found after adding a recipe.");
    }
    await recipeCardToOpen.click();
    // Check for the recipe details modal or container
    const details = page.locator(".recipe-details-modal, .recipe-details");
    await expect(details).toBeVisible();
    // Find any heading inside the details container
    const heading = details.locator("h1, h2, h3, h4, h5, h6");
    if ((await heading.count()) === 0) {
      const dom = await page.content();
      console.error("DOM after opening recipe details:", dom);
      throw new Error("No heading found in recipe details modal/container.");
    }
    await expect(heading.first()).toBeVisible();
  });
});
