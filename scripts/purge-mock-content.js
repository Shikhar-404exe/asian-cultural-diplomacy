const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purgeMockContent() {
  console.log('--- PURGING ALL MOCK / SEED ARTICLES, EVENTS & MEETUPS ---');

  // Delete article relations first
  const delRevisions = await prisma.articleRevision.deleteMany({});
  console.log(`Deleted article revisions: ${delRevisions.count}`);

  const delTags = await prisma.articleTag.deleteMany({});
  console.log(`Deleted article tags: ${delTags.count}`);

  const delComments = await prisma.comment.deleteMany({});
  console.log(`Deleted comments: ${delComments.count}`);

  const delArticles = await prisma.article.deleteMany({});
  console.log(`Deleted articles: ${delArticles.count}`);

  const delEvents = await prisma.event.deleteMany({});
  console.log(`Deleted events: ${delEvents.count}`);

  const delMeetups = await prisma.meetup.deleteMany({});
  console.log(`Deleted meetups: ${delMeetups.count}`);

  const finalCounts = {
    users: await prisma.user.count(),
    adminUsers: await prisma.adminUser.count(),
    articles: await prisma.article.count(),
    events: await prisma.event.count(),
    meetups: await prisma.meetup.count(),
    comments: await prisma.comment.count(),
    enquiries: await prisma.contactEnquiry.count(),
    categories: await prisma.category.count(),
    siteSettings: await prisma.siteSettings.count(),
    mediaItems: await prisma.mediaItem.count(),
  };

  console.log('Final Database Counts After Mock Content Purge:');
  console.log(JSON.stringify(finalCounts, null, 2));
}

purgeMockContent()
  .catch((e) => {
    console.error('Error purging content:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

