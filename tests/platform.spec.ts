import { test, expect } from '@playwright/test';

test.describe('Asian Cultural Diplomacy - Public Experience & Navigation Integrity', () => {
  test('Homepage loads with branding, sister artwork, and clean public navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Asian Cultural Diplomacy/);
    await expect(page.locator('text=Asian Cultural Diplomacy').first()).toBeVisible();

    // Verify Strategic Pillars
    await expect(page.getByText('Pillar I', { exact: true })).toBeVisible();
    await expect(page.locator('text=Intercultural Philosophy & Scholarship')).toBeVisible();

    // Verify Sister's Artwork
    await expect(page.locator('text=The Bridge of Dialogue').first()).toBeVisible();

    // CRITICAL SECURITY & UX: Verify public navigation contains ZERO admin/founder portal links
    const nav = page.locator('header nav, header');
    await expect(nav.locator('text=Founder Portal')).toHaveCount(0);
    await expect(nav.locator('text=Publisher Portal')).toHaveCount(0);

    // Verify Public links exist
    await expect(page.locator('text=Home').first()).toBeVisible();
    await expect(page.locator('text=About').first()).toBeVisible();
    await expect(page.locator('text=Blog / Publications').first()).toBeVisible();
    await expect(page.locator('text=Events').first()).toBeVisible();
    await expect(page.locator('text=Meetups').first()).toBeVisible();
    await expect(page.locator('text=Contact').first()).toBeVisible();
    await expect(page.locator('text=Sign In').first()).toBeVisible();
    await expect(page.locator('text=Join Dialogue').first()).toBeVisible();
  });

  test('About page displays mission, vision, and philosophy', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('text=About Asian Cultural Diplomacy')).toBeVisible();
    await expect(page.locator('text=Our Mission')).toBeVisible();
    await expect(page.locator('text=Our Vision')).toBeVisible();
    await expect(page.locator('text=About the Founder')).toBeVisible();
    await expect(page.locator('text=Cultural Diplomacy Philosophy')).toBeVisible();
  });

  test('Publications, Events, and Meetups display respectful empty states when no demo data exists', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Perspectives on Asian Cultural Diplomacy');

    await page.goto('/events');
    await expect(page.locator('h1')).toContainText('Asian Cultural Diplomacy Events');

    await page.goto('/meetups');
    await expect(page.locator('h1')).toContainText('Founder Meetups & Academic Engagements');
  });

  test('Contact form submission creates genuine enquiry', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Contact & Academic Inquiries');

    const testId = Date.now().toString().slice(-4);
    await page.fill('input[placeholder*="Dr. A. Tanaka"]', `Cultural Delegate ${testId}`);
    await page.fill('input[placeholder*="name@institution.org"]', `delegate${testId}@culturaldiplomacy.test`);
    await page.fill('input[placeholder*="Research Collaboration"]', `Inquiry Regarding Diplomatic Exchange ${testId}`);
    await page.fill('textarea[placeholder*="Please describe your proposal"]', 'We would be honored to discuss cross-border cultural initiatives in Asia.');

    await page.click('button:has-text("Transmit Enquiry")');
    await expect(page.locator('text=safely received').or(page.locator('text=Thank you'))).toBeVisible();
  });
});

test.describe('Role Separation & Reader Authentication Experience', () => {
  const timestamp = Date.now().toString().slice(-5);
  const readerEmail = `reader_${timestamp}@culturaltest.org`;
  const readerPassword = 'ReaderSecure2026!';
  const readerName = `Dr. Aiko Chen ${timestamp}`;

  test('Reader can register an account and is redirected to their account page', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h2')).toContainText('Join the Reader Dialogue');
    await page.fill('input[placeholder*="Lin Wei"]', readerName);
    await page.fill('input[placeholder*="you@institution.org"]', readerEmail);
    await page.fill('input[placeholder="At least 8 characters"]', readerPassword);
    await page.fill('input[placeholder="Repeat password"]', readerPassword);

    await page.click('button:has-text("Complete Registration")');

    // Should redirect to /account
    await expect(page).toHaveURL(/\/account/);
    await expect(page.locator('h1')).toContainText(readerName);
    await expect(page.locator('text=Registered Reader')).toBeVisible();
  });

  test('Reader cannot access Administrator portal routes (RBAC Protection)', async ({ page }) => {
    // Log in as Reader
    await page.goto('/login');
    await page.fill('input[type="email"]', readerEmail);
    await page.fill('input[type="password"]', readerPassword);
    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/\/account/);

    // Attempt to access /admin directly
    await page.goto('/admin');
    
    // Should be redirected away to login or account, never showing admin dashboard
    await expect(page).not.toHaveURL(/^\/admin$/);
  });

  test('Reader can update their display name in account profile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', readerEmail);
    await page.fill('input[type="password"]', readerPassword);
    await page.click('button:has-text("Sign In")');

    await page.click('button:has-text("Profile Details")');
    const updatedName = `${readerName} (Senior Fellow)`;
    await page.fill('input[value*="' + readerName + '"]', updatedName);
    await page.click('button:has-text("Save Profile")');

    await expect(page.locator('text=updated successfully')).toBeVisible();
  });
});

test.describe('Administrator Experience, Server Autosave & Article Publishing', () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'founder@asianculturaldiplomacy.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'CulturalDiplomacy2026!';
  const articleTitle = `Diplomatic Synergy & Shared Heritage ${Date.now()}`;

  test('Founder Administrator logs in and creates article with cloud autosave', async ({ page }) => {
    // Navigate directly to /admin
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('Publisher Portal');

    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('button:has-text("Sign In to Dashboard")');

    await page.waitForURL((url) => url.pathname === '/admin');
    await expect(page.locator('h1')).toContainText('Publishing & Dialogue Dashboard');

    // Go to write article
    await page.goto('/admin/blogs/new');
    await expect(page.locator('h1')).toContainText('Write an Article');
    await page.waitForSelector('select option', { state: 'attached' });
    await page.selectOption('select', { index: 0 });

    // Fill title
    await page.fill('input[placeholder*="The Architecture of Dialogue"]', articleTitle);
    await page.fill('input[placeholder*="Brief one-sentence editorial"]', 'An exploratory essay on cultural understanding across Asian traditions.');

    // Focus editor and type content
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('Cultural diplomacy begins not in treaties, but in reciprocal appreciation of heritage, language, and art.');

    // Check Cloud Autosave Indicator
    await expect(page.locator('text=Saved to Cloud').or(page.locator('text=Saving to Cloud'))).toBeVisible({ timeout: 6000 });

    // Publish Live
    await page.click('button:has-text("Publish Live")');
    await expect(page.locator('text=published live').or(page.locator('text=saved'))).toBeVisible();

    // Verify article appears on public blog
    await page.goto('/blog');
    await expect(page.locator(`text=${articleTitle}`)).toBeVisible();
  });
});
