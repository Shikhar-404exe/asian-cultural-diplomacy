const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const dir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch();
  
  // Desktop Context
  const contextDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await contextDesktop.newPage();

  console.log('Capturing Desktop Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'homepage-desktop.png'), fullPage: true });

  console.log('Capturing Single Article Page...');
  await page.goto('http://localhost:3000/blog/architecture-of-dialogue-building-bridges', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'single-article.png'), fullPage: true });

  console.log('Capturing Events Page...');
  await page.goto('http://localhost:3000/events', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'events-page.png'), fullPage: true });

  console.log('Capturing Meetups Page...');
  await page.goto('http://localhost:3000/meetups', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'meetups-page.png'), fullPage: true });

  console.log('Capturing Admin Login & Dashboard...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'admin-login.png') });

  await page.fill('input[type="email"]', 'founder@asianculturaldiplomacy.org');
  await page.fill('input[type="password"]', 'CulturalDiplomacy2026!');
  await page.click('button:has-text("Sign In to Dashboard")');
  await page.waitForURL('**/admin');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(dir, 'admin-dashboard.png'), fullPage: true });

  console.log('Capturing Admin Write Blog...');
  await page.goto('http://localhost:3000/admin/blogs/new', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, 'admin-write-blog.png'), fullPage: true });

  // Mobile Context
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await contextMobile.newPage();

  console.log('Capturing Mobile Homepage...');
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: path.join(dir, 'homepage-mobile.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully in screenshots/');
}

main().catch(console.error);
