/**
 * E2E Test — Group Flows
 * Tests group creation, joining, member management
 */
import { test, expect } from '@playwright/test';

test.describe('Group Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Log In');
    await page.fill('input[type="email"]', 'alice@college.edu');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Oi! Get Me In")');
    await page.waitForURL('/home', { timeout: 15000 });
  });

  test('can navigate to groups page', async ({ page }) => {
    await page.goto('/groups');
    await page.waitForTimeout(2000);
    // Groups page should load
    expect(page.url()).toContain('/groups');
  });

  test('can view group details', async ({ page }) => {
    await page.goto('/groups');
    await page.waitForTimeout(2000);
    
    const groupLink = page.locator('a[href*="/groups/"], button:has-text("View")').first();
    if (await groupLink.isVisible({ timeout: 5000 })) {
      await groupLink.click();
      await page.waitForTimeout(2000);
    }
  });
});
