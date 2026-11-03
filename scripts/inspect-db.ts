import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, title: true, isPublished: true, author: true, createdAt: true },
  });

  const categories = await prisma.category.findMany();

  const events = await prisma.event.findMany({
    select: { id: true, slug: true, title: true, status: true, startDate: true },
  });

  const meetups = await prisma.meetup.findMany({
    select: { id: true, slug: true, title: true, status: true, date: true },
  });

  const enquiries = await prisma.contactEnquiry.findMany();

  const comments = await prisma.comment.findMany();

  const media = await prisma.mediaItem.findMany();

  const siteSettings = await prisma.siteSettings.findMany();

  const auditLogCount = await prisma.auditLog.count();

  console.log(JSON.stringify({
    users,
    articlesCount: articles.length,
    articles,
    categoriesCount: categories.length,
    categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    eventsCount: events.length,
    events,
    meetupsCount: meetups.length,
    meetups,
    enquiriesCount: enquiries.length,
    enquiries,
    commentsCount: comments.length,
    comments,
    mediaCount: media.length,
    media: media.map(m => ({ id: m.id, fileName: m.fileName, fileUrl: m.fileUrl })),
    siteSettings,
    auditLogCount,
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
