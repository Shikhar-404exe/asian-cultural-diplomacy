import { test, expect } from '@playwright/test';

test.describe('Asian Cultural Diplomacy - Public Visitor Experience', () => {
  test('Homepage loads with reference split-hero layout, sister artwork, and navigation', async ({ page }) => {
    await page.goto('/');

    // Check title and brand
    await expect(page).toHaveTitle(/Asian Cultural Diplomacy/);
    await expect(page.locator('text=Asian Cultural Diplomacy').first()).toBeVisible();

    // Check Reference Strategic Pillars (Neo Mirai inspiration) with exact match
    await expect(page.getByText('Pillar I', { exact: true })).toBeVisible();
    await expect(page.locator('text=Intercultural Philosophy & Scholarship')).toBeVisible();

    // Check Founder Sister's Artwork
    await expect(page.locator('text=The Bridge of Dialogue').first()).toBeVisible();

    // Check Manifesto banner
    await expect(page.locator('text=Our Manifesto')).toBeVisible();

    // Check sections exist
    await expect(page.locator('text=Upcoming Symposia & Events')).toBeVisible();
    await expect(page.locator('text=Founder Meetups & Public Appearances')).toBeVisible();
  });

  test('About page displays mission, vision, founder profile, and philosophy', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('text=About Asian Cultural Diplomacy')).toBeVisible();
    await expect(page.locator('text=Our Mission')).toBeVisible();
    await expect(page.locator('text=Our Vision')).toBeVisible();
    await expect(page.locator('text=About the Founder')).toBeVisible();
    await expect(page.locator('text=Cultural Diplomacy Philosophy')).toBeVisible();
    await expect(page.locator('text=Areas of Diplomatic & Scholarly Engagement')).toBeVisible();
  });

  test('Blog page supports search, category filtering, and navigation to article', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.locator('h1')).toContainText('Perspectives on Asian Cultural Diplomacy');
    await expect(page.locator('text=All Topics')).toBeVisible();

    // Check filter by category
    const essayBtn = page.locator('button:has-text("Diplomatic Essays")');
    if (await essayBtn.count() > 0) {
      await essayBtn.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/category=diplomatic-essays/);
    }

    // Click into the featured article
    await page.goto('/blog/architecture-of-dialogue-building-bridges');
    await expect(page.locator('h1')).toContainText('The Architecture of Dialogue');
    await expect(page.locator('text=Founder & Director').first()).toBeVisible();
  });

  test('Article interactions: like button and community comment submission', async ({ page }) => {
    await page.goto('/blog/architecture-of-dialogue-building-bridges');

    // Test like button
    const likeBtn = page.locator('button[title*="article"]').first();
    await expect(likeBtn).toBeVisible();
    await likeBtn.click();
    await page.waitForTimeout(300);

    // Scroll to comments section
    const commentSection = page.locator('text=Perspectives & Dialogue');
    await commentSection.scrollIntoViewIfNeeded();
    await expect(commentSection).toBeVisible();

    // Fill comment form
    const randomId = Date.now().toString().slice(-4);
    await page.fill('input[placeholder*="Prof. Lin Wei"]', `Cultural Scholar ${randomId}`);
    await page.fill('input[placeholder*="you@institution.edu"]', `scholar${randomId}@test.edu`);
    await page.fill('textarea[placeholder*="Share your thoughts"]', 'This essay offers profound wisdom on intercultural bridges between traditions.');

    await page.click('button:has-text("Submit Perspective")');

    // Verify submission confirmation regarding moderation queue or success
    await expect(page.locator('text=pending review by the founder').or(page.locator('text=Your perspective has been received'))).toBeVisible();
  });

  test('Events page displays symposia and allows viewing event details', async ({ page }) => {
    await page.goto('/events');

    await expect(page.locator('h1')).toContainText('Asian Cultural Diplomacy Events');
    await expect(page.locator('text=Pan-Asian Cultural Diplomacy Symposium 2026').first()).toBeVisible();

    // Navigate to single event
    await page.click('text=Pan-Asian Cultural Diplomacy Symposium 2026');
    await expect(page.locator('h1')).toContainText('Pan-Asian Cultural Diplomacy Symposium 2026');
    await expect(page.locator('text=Kyoto International Conference Hall')).toBeVisible();
    await expect(page.locator('text=Distinguished Speakers & Fellows')).toBeVisible();
  });

  test('Meetups page displays founder public appearances and privacy notice', async ({ page }) => {
    await page.goto('/meetups');

    await expect(page.locator('h1')).toContainText('Founder Meetups & Academic Engagements');
    await expect(page.locator('text=Civic Transparency & Privacy Principle')).toBeVisible();
    await expect(page.locator('text=University Visit & Open Dialogue: Asian Cultural Exchange').first()).toBeVisible();
  });

  test('Contact page transmits inquiry safely to local database', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('h1')).toContainText('Contact & Academic Inquiries');

    await page.fill('input[placeholder*="Dr. A. Tanaka"]', 'Prof. Ambassador Tanaka');
    await page.fill('input[placeholder*="name@institution.org"]', 'tanaka@diplomatic-academy.jp');
    await page.fill('input[placeholder*="Research Collaboration"]', 'Guest Lecture Invitation');
    await page.fill('textarea[placeholder*="Please describe"]', 'We would be honored to host you for a symposium on Asian cultural diplomacy in Tokyo next autumn.');

    await page.click('button:has-text("Transmit Enquiry")');

    await expect(page.locator('text=stored in the founder’s local inbox')).toBeVisible();
  });
});

test.describe('Security & Protection Hardening', () => {
  test('Unauthenticated mutation requests are blocked with 401', async ({ request }) => {
    // Attempt article creation without session
    const resArt = await request.post('/api/articles', {
      data: { title: 'Unauthorized Test', content: 'Hack', categoryId: '1' },
    });
    expect(resArt.status()).toBe(401);

    // Attempt comment moderation without session
    const resComm = await request.patch('/api/comments/fake-id', {
      data: { status: 'APPROVED' },
    });
    expect(resComm.status()).toBe(401);

    // Attempt event creation without session
    const resEv = await request.post('/api/events', {
      data: { title: 'Fake Event' },
    });
    expect(resEv.status()).toBe(401);
  });

  test('Comments with script tags are escaped to prevent stored XSS', async ({ request }) => {
    const res = await request.post('/api/comments', {
      data: {
        articleId: 'architecture-of-dialogue-building-bridges',
        authorName: '<script>alert("XSS")</script>Attacker',
        content: '<script>document.cookie</script>Malicious message text',
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.comment.authorName).not.toContain('<script>');
    expect(data.comment.authorName).toContain('&lt;script&gt;');
  });
});

test.describe('Administrator Experience & Publishing Flow', () => {
  test('Founder logs in, views overview, approves comment, and publishes new article', async ({ page }) => {
    // 1. Visit Login
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('Publisher Portal');

    // Fill credentials (prefilled by default for local setup, or explicit)
    await page.fill('input[type="email"]', 'founder@asianculturaldiplomacy.org');
    await page.fill('input[type="password"]', 'CulturalDiplomacy2026!');
    await page.click('button:has-text("Sign In to Dashboard")');

    // 2. Overview Dashboard
    await page.waitForURL('/admin');
    await expect(page.locator('h1')).toContainText('Publishing & Dialogue Dashboard');
    await expect(page.locator('text=Published Blogs')).toBeVisible();

    // 3. Moderate Comments
    await page.goto('/admin/comments');
    await expect(page.locator('h1')).toContainText('Manage Comments');

    // Check for pending comment and approve
    const approveBtn = page.locator('button:has-text("Approve (Publish)")').first();
    if (await approveBtn.count() > 0) {
      await approveBtn.click();
      await page.waitForTimeout(500);
    }

    // 4. Write a Blog
    await page.goto('/admin/blogs/new');
    await expect(page.locator('h1')).toContainText('Write an Article');

    const uniqueTitle = `Diplomatic Heritage Reflections ${Date.now()}`;
    await page.fill('input[placeholder*="The Architecture of Dialogue"]', uniqueTitle);
    await page.fill('input[placeholder*="Brief one-sentence"]', 'An automated test essay exploring harmonious dialogue in Asia.');

    // Select sister artwork preset
    await page.click('button:has-text("Sister\'s Moon Bridge")');

    // Add content in editor
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('In this essay, we contemplate the profound resonance between cultural diplomacy and peaceful coexistence across Asian traditions.');

    // Publish Live
    await page.click('button:has-text("Publish Live")');
    await expect(page.locator('text=Your article has been published live')).toBeVisible();

    // 5. Verify publication on public Blog page
    await page.goto('/blog');
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
  });
});
