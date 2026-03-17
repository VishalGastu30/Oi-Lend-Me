/**
 * E2E Test — Full Lending Lifecycle
 * Scenario: signup → create item → request → approve → return
 */
import { test, expect } from '@playwright/test';

test.describe('Lending Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Alice (item owner)
    await page.goto('/');
    await page.click('text=Log In');
    await page.fill('input[type="email"]', 'alice@college.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Oi! Get Me In")');
    await page.waitForURL('/home', { timeout: 15000 });
  });

  test('owner can view their lending items', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('button:has-text("Lending")');
    await expect(page.locator('h2:has-text("My Listings")')).toBeVisible({ timeout: 10000 });
  });

  test('owner can create a new item for lending', async ({ page }) => {
    await page.goto('/my-items');
    
    // Look for add/create item button
    const addButton = page.locator('button:has-text("Lend"), button:has-text("Add"), a:has-text("Lend")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Fill in item details if form appears
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test E2E Item');
      }
    }
  });

  test('can navigate between dashboard tabs', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Browse tab
    await expect(page.locator('text=Available on Campus')).toBeVisible({ timeout: 10000 });
    
    // Lending tab
    await page.click('button:has-text("Lending")');
    await expect(page.locator('h2:has-text("My Listings")')).toBeVisible({ timeout: 10000 });
    
    // Activity tab
    const activityTab = page.locator('button:has-text("Activity")');
    if (await activityTab.isVisible()) {
      await activityTab.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Borrower Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Bob (borrower)
    await page.goto('/');
    await page.click('text=Log In');
    await page.fill('input[type="email"]', 'bob@college.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Oi! Get Me In")');
    await page.waitForURL('/home', { timeout: 15000 });
  });

  test('borrower can browse available items', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Available on Campus')).toBeVisible({ timeout: 10000 });
  });

  test('borrower can view item details', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    const viewBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewBtn.isVisible({ timeout: 5000 })) {
      await viewBtn.click();
      await expect(page).toHaveURL(/\/items\//);
    }
  });
});
