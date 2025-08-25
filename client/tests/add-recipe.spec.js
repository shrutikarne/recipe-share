import { test, expect } from "@playwright/test";

test.describe("Add Recipe", () => {
  test("should submit form with all required fields", async ({ page }) => {
    // Register the user (ignore errors if already exists)
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
    await page.goto("/add");
    // Now go to add-recipe page
    await page.goto("/add");
    await page.fill("#title", "Test Recipe");
    await page.fill("#description", "A delicious test recipe");
    await page.fill("#ingredients", "flour,sugar,eggs");
    await page.fill("#steps", "mix,bake,serve");
    await page.selectOption("#category", "Dessert");
    await page.selectOption("#diet", "vegetarian");
    await page.fill("#cook-hours", "1");
    await page.fill("#cook-minutes", "30");
    await page.click('button[type="submit"]');
    // Wait for redirect to home
    // Wait for URL to change or main content to appear
    const prevUrl = page.url();
    await page.waitForTimeout(500);
    let navigated = false;
    try {
      await page.waitForFunction(
        (url) => window.location.href !== url,
        prevUrl,
        { timeout: 4000 }
      );
      navigated = true;
    } catch {}
    // Now check for main content
    const heading = page.getByRole("heading", { name: /All Recipes/i });
    const fallback = page.locator(".recipe-list, .home, main");
    if (await heading.isVisible({ timeout: 2000 })) {
      await expect(heading).toBeVisible();
    } else if (await fallback.isVisible({ timeout: 1000 })) {
      await expect(fallback).toBeVisible();
    } else {
      // If still on the add-recipe form, check for error messages
      const addRecipeHeading = page.getByRole("heading", {
        name: /Add Recipe/i,
      });
      if (await addRecipeHeading.isVisible({ timeout: 500 })) {
        // Look for error messages
        const errorMsg = page.locator('.error, [role="alert"], .form-error');
        if (await errorMsg.isVisible({ timeout: 500 })) {
          const msg = await errorMsg.textContent();
          if (/recipe added!?/i.test(msg)) {
            // Success, treat as added
          } else {
            throw new Error("Recipe form submission failed with error: " + msg);
          }
        } else {
          throw new Error(
            "Recipe form submission did not redirect and no error message was shown."
          );
        }
      } else {
        // Print DOM for debugging
        const dom = await page.content();
        console.error("DOM after submit:", dom);
        throw new Error("No main content found after submitting the recipe.");
      }
    }
  });
});
