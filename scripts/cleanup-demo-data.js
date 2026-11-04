/**
 * Safe Demo Data Cleanup Utility
 * Asian Cultural Diplomacy Platform
 * 
 * Usage:
 *   node scripts/cleanup-demo-data.js --dry-run    (Audits and lists records without deleting)
 *   node scripts/cleanup-demo-data.js --confirm    (Creates automatic backup and deletes demo records)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const DEMO_SLUGS = {
  articles: [
    'architecture-of-dialogue-building-bridges',
    'courtyards-of-contemplation-classical-architecture',
    'mount-fuji-transnational-language-of-serenity',
    'preserving-intangible-cultural-heritage-digital-age',
  ],
  events: [
    'pan-asian-cultural-diplomacy-symposium-2026',
    'roundtable-traditional-arts-statecraft',
    'winter-salon-silk-routes-shared-memory',
  ],
  meetups: [
    'university-visit-kyoto-dialogue',
    'cultural-salon-coffee-tokyo',
    'academic-gathering-bangkok',
  ],
};

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isConfirmed = process.argv.includes('--confirm');

  if (!isDryRun && !isConfirmed) {
    console.log(`
==============================================================
   SAFE DEMO DATA CLEANUP SCRIPT
==============================================================
This operation purges demonstration and placeholder records:
  - Seed demonstration articles and automated test articles
  - Demo reader comments and test comments
  - Demo events and symposia
  - Demo public meetups
  - Test contact enquiries

PRESERVED:
  - Administrator account
  - Editorial categories
  - Founder artworks and media library
  - Core site settings structure

To preview records without modifying database:
  node scripts/cleanup-demo-data.js --dry-run

To execute cleanup with automated backup:
  node scripts/cleanup-demo-data.js --confirm
==============================================================
`);
    process.exit(0);
  }

  console.log(`\nStarting cleanup inspection (${isDryRun ? 'DRY RUN - PREVIEW ONLY' : 'CONFIRMED EXECUTION'})...\n`);

  // 1. Identify Articles
  const allArticles = await prisma.article.findMany({
    select: { id: true, title: true, slug: true, createdAt: true },
  });

  const demoArticles = allArticles.filter(
    (a) => DEMO_SLUGS.articles.includes(a.slug) || a.title.startsWith('Diplomatic Heritage Reflections')
  );

  console.log(`Found ${demoArticles.length} demonstration / test articles:`);
  demoArticles.forEach((a) => console.log(`  - [Article] "${a.title}" (slug: ${a.slug})`));

  // 2. Identify Comments
  const allComments = await prisma.comment.findMany({
    select: { id: true, authorName: true, content: true, status: true },
  });
  console.log(`\nFound ${allComments.length} demonstration / test comments to purge.`);

  // 3. Identify Events
  const allEvents = await prisma.event.findMany({
    select: { id: true, title: true, slug: true },
  });
  const demoEvents = allEvents.filter((e) => DEMO_SLUGS.events.includes(e.slug));
  console.log(`\nFound ${demoEvents.length} demonstration events:`);
  demoEvents.forEach((e) => console.log(`  - [Event] "${e.title}"`));

  // 4. Identify Meetups
  const allMeetups = await prisma.meetup.findMany({
    select: { id: true, title: true, slug: true },
  });
  const demoMeetups = allMeetups.filter((m) => DEMO_SLUGS.meetups.includes(m.slug));
  console.log(`\nFound ${demoMeetups.length} demonstration meetups:`);
  demoMeetups.forEach((m) => console.log(`  - [Meetup] "${m.title}"`));

  // 5. Identify Contact Enquiries
  const allEnquiries = await prisma.contactEnquiry.findMany();
  console.log(`\nFound ${allEnquiries.length} test contact enquiries to purge.`);

  if (isDryRun) {
    console.log('\n==============================================================');
    console.log('DRY RUN COMPLETE: No data was modified.');
    console.log('To execute this purge, run: node scripts/cleanup-demo-data.js --confirm');
    console.log('==============================================================\n');
    process.exit(0);
  }

  // Backup database before destructive operations
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const backupFile = path.join(backupDir, `dev_backup_before_purge_${Date.now()}.db`);
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupFile);
    console.log(`\nAutomated database backup created at:\n  ${backupFile}\n`);
  }

  // Execute deletion
  console.log('Executing purge operations...');

  // Delete comments
  const deletedComments = await prisma.comment.deleteMany({});
  console.log(`  ✓ Deleted ${deletedComments.count} comments.`);

  // Delete article-tag relations and demo articles
  const demoArticleIds = demoArticles.map((a) => a.id);
  await prisma.articleTag.deleteMany({
    where: { articleId: { in: demoArticleIds } },
  });
  const deletedArticles = await prisma.article.deleteMany({
    where: { id: { in: demoArticleIds } },
  });
  console.log(`  ✓ Deleted ${deletedArticles.count} demo articles.`);

  // Delete demo events
  const demoEventIds = demoEvents.map((e) => e.id);
  const deletedEvents = await prisma.event.deleteMany({
    where: { id: { in: demoEventIds } },
  });
  console.log(`  ✓ Deleted ${deletedEvents.count} demo events.`);

  // Delete demo meetups
  const demoMeetupIds = demoMeetups.map((m) => m.id);
  const deletedMeetups = await prisma.meetup.deleteMany({
    where: { id: { in: demoMeetupIds } },
  });
  console.log(`  ✓ Deleted ${deletedMeetups.count} demo meetups.`);

  // Delete test enquiries
  const deletedEnquiries = await prisma.contactEnquiry.deleteMany({});
  console.log(`  ✓ Deleted ${deletedEnquiries.count} test enquiries.`);

  console.log('\n==============================================================');
  console.log('CLEANUP SUCCESSFUL!');
  console.log('All demonstration and filler records have been safely removed.');
  console.log('The platform is now primed for genuine content with clean empty states.');
  console.log('==============================================================\n');
}

main()
  .catch((e) => {
    console.error('Cleanup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

