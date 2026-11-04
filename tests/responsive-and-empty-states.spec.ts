import { test, expect } from '@playwright/test';

const viewports = [
  { name: '1366x768 (Standard Laptop)', width: 1366, height: 768 },
  { name: '1440x900 (MacBook Standard)', width: 1440, height: 900 },
  { name: '1920x1080 (Full HD Desktop)', width: 1920, height: 1080 },
];

test.describe('Responsive Layout & Visual Integrity Across Desktop/Laptop Viewports', () => {
  for (const vp of viewports) {
    test(`Renders homepage seamlessly on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Verify title & brand
      await expect(page).toHaveTitle(/Asian Cultural Diplomacy/);
      await expect(page.locator('text=Asian Cultural Diplomacy').first()).toBeVisible();

      // Verify split hero layout
      await expect(page.getByText('Pillar I', { exact: true })).toBeVisible();
      await expect(page.locator('text=The Bridge of Dialogue').first()).toBeVisible();

      // Check for horizontal overflow (must not have horizontal scrollbar on body)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allowance for fractional pixel rounding
    });

    test(`Renders publications page with empty state on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/blog');
      await expect(page.locator('h1')).toContainText('Perspectives on Asian Cultural Diplomacy');
      // Verify clean polite empty state message
      await expect(page.locator('text=No publications have been published yet.')).toBeVisible();
    });

    test(`Renders events page with empty state on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/events');
      await expect(page.locator('h1')).toContainText('Asian Cultural Diplomacy Events');
      await expect(page.locator('text=No upcoming events at the moment.')).toBeVisible();
    });

    test(`Renders meetups page with empty state on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/meetups');
      await expect(page.locator('h1')).toContainText('Founder Meetups & Academic Engagements');
      await expect(page.locator('text=No meetups have been announced yet.')).toBeVisible();
    });
  }
});

test.describe('Admin Login Navigation Transition & Hook Order Resilience', () => {
  test('Admin login transitions smoothly to /admin without React error #300', async ({ page }) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'shashwatiprajapati@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'CulturalShashwati@2026';

    let consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/admin/login');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button:has-text("Sign In to Dashboard")');

    await page.waitForURL((url) => url.pathname === '/admin', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Publishing & Dialogue Dashboard');

    // Confirm no React Minified Error #300 or hook mismatch errors occurred
    const hasHookError = consoleErrors.some((e) => e.includes('Minified React error #300') || e.includes('Rendered fewer hooks'));
    expect(hasHookError).toBeFalsy();
  });
});

