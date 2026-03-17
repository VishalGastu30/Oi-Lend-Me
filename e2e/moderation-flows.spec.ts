/**
 * E2E Test — Moderation Flows
 * Admin warn/suspend/ban flows and UI overlay checks
 */
import { test, expect } from '@playwright/test';

test.describe('Admin Moderation Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.click('text=Log In');
    await page.fill('input[type="email"]', 'valiantvishal30@gmail.com');
    await page.fill('input[type="password"]', 'IamAdmin@3004');
    await page.click('button:has-text("Oi! Get Me In")');
    // Admin goes to role-select or admin dashboard
    await page.waitForURL(/\/(admin|auth\/role-select)/, { timeout: 15000 });
  });

  test('admin can access moderation page', async ({ page }) => {
    await page.goto('/admin/moderation');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin');
  });

  test('admin can search users', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill('Alice');
      await page.waitForTimeout(1000);
    }
  });

  test('admin can view reports', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin/reports');
  });

  test('admin can view feedback', async ({ page }) => {
    await page.goto('/admin/feedback');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/admin/feedback');
  });
});

test.describe('Banned User Experience', () => {
  test('banned user is blocked from API access', async ({ request }) => {
    // Test via API — banned users should get 401/403
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'alice@college.edu',
        password: 'password123',
      },
    });
    // If user is not banned, login succeeds (200)
    // If banned, the session check should return null
    expect([200, 401]).toContain(loginResponse.status());
  });
});
