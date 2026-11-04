const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const counts = {
    users: await prisma.user.count(),
    adminUsers: await prisma.adminUser.count(),
    articles: await prisma.article.count(),
    events: await prisma.event.count(),
    meetups: await prisma.meetup.count(),
    comments: await prisma.comment.count(),
    enquiries: await prisma.contactEnquiry.count(),
    categories: await prisma.category.count(),
    media: await prisma.mediaItem.count(),
  };
  console.log('Database Counts:', JSON.stringify(counts, null, 2));

  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, name: true } });
  console.log('Users in DB:', users);

  if (counts.articles > 0) {
    const articles = await prisma.article.findMany({ select: { id: true, title: true, slug: true } });
    console.log('Articles:', articles);
  }
  if (counts.events > 0) {
    const events = await prisma.event.findMany({ select: { id: true, title: true, slug: true } });
    console.log('Events:', events);
  }
  if (counts.meetups > 0) {
    const meetups = await prisma.meetup.findMany({ select: { id: true, title: true, slug: true } });
    console.log('Meetups:', meetups);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

