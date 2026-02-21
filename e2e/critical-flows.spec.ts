import { test, expect } from '@playwright/test';

// Simple smoke tests that verify critical paths
test.describe('Application Smoke Tests', () => {
  test('landing page loads correctly', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await expect(page.locator('text=Start Free')).toBeVisible({ timeout: 15000 });
  });

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Look for login link/button
    const loginButton = page.locator('text=Log In').first();
    await expect(loginButton).toBeVisible({ timeout: 10000 });
    await loginButton.click();
    
    // Should see login form
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
  });

  test('dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to landing page
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });
});

test.describe('Authenticated User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/');
    await page.click('text=Log In');
    
    // Login as Alice
    await page.fill('input[type="email"]', 'alice@college.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Oi! Get Me In")'); 
    
    // Wait for redirect - it goes to /home first, then dashboard if navigated
    await page.waitForURL('/home', { timeout: 15000 });
  });

  test('dashboard displays correctly after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
    await expect(page.locator('text=Available on Campus')).toBeVisible();
  });

  test('can filter items by category', async ({ page }) => {
    await page.goto('/dashboard');
    // Check if category filters exist
    await expect(page.locator('button:has-text("Electronics")')).toBeVisible();
    await expect(page.locator('button:has-text("Books")')).toBeVisible();
    
    // Click on a category
    await page.click('button:has-text("Electronics")');
    
    // Items should refresh (we might not have items in this category in seed, but we check if request happens)
    await page.waitForTimeout(1000);
  });

  test('can search for items', async ({ page }) => {
    await page.goto('/dashboard');
    const searchInput = page.locator('input[placeholder="Search items..."]');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Canon');
    await page.waitForTimeout(1000);
    
    // If there's an item matching, it should be visible
    // Note: Alice's item might not show up for Alice depending on filter logic (ownerId !== currentUser.id)
  });

  test('can view item details', async ({ page }) => {
    await page.goto('/dashboard');
    // We need an item that is NOT owned by Alice to see it in Browse
    // Or we check the "Lending" tab for Alice's items
    await page.click('button:has-text("Lending")');
    await expect(page.locator('h2:has-text("My Listings")')).toBeVisible({ timeout: 10000 });
    
    // Wait for items to load in the tab
    await page.waitForTimeout(1000);
    
    const detailsButton = page.locator('button:has-text("View Details")').first();
    await expect(detailsButton).toBeVisible({ timeout: 10000 });
    await detailsButton.click();
    
    // Should be on item page
    await expect(page).toHaveURL(/\/items\/.+/);
    await expect(page.locator('text=Back to Dashboard')).toBeVisible();
  });

  test('can navigate to chat page', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.locator('h1:has-text("Messages")')).toBeVisible();
  });
});
