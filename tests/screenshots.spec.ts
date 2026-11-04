import { test } from '@playwright/test';

test.describe('Visual Screenshot Capture for Production Audit', () => {
  test('Capture key production screens', async ({ page }) => {
    // 1. Clean Homepage (Zero admin chrome in header)
    await page.goto('/');
    await page.screenshot({ path: 'screenshots/01_homepage_clean_nav.png', fullPage: true });

    // 2. Reader Sign In Page
    await page.goto('/login');
    await page.screenshot({ path: 'screenshots/02_reader_login.png', fullPage: true });

    // 3. Reader Registration Page
    await page.goto('/register');
    await page.screenshot({ path: 'screenshots/03_reader_register.png', fullPage: true });

    // 4. Publications List with Respectful Empty State
    await page.goto('/blog');
    await page.screenshot({ path: 'screenshots/04_publications_page.png', fullPage: true });

    // 5. Admin Portal Login
    await page.goto('/admin/login');
    await page.screenshot({ path: 'screenshots/05_admin_portal_login.png', fullPage: true });

    // 6. Admin Blog Editor with Cloud Autosave
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL || 'shashwatiprajapati@gmail.com');
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD || 'CulturalShashwati@2026');
    await page.click('button:has-text("Sign In to Dashboard")');
    await page.goto('/admin/blogs/new');
    await page.fill('input[placeholder*="The Architecture of Dialogue"]', 'Cultural Bridges in Modern Diplomacy');
    await page.waitForTimeout(2700); // Allow server autosave to show "Saved to Cloud"
    await page.screenshot({ path: 'screenshots/06_admin_editor_cloud_autosave.png', fullPage: true });
  });
});

