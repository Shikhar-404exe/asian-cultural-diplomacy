const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, isEmailVerified: true } });
  const admins = await prisma.adminUser.findMany({ select: { id: true, email: true, name: true, role: true } });
  const articles = await prisma.article.findMany({ select: { id: true, title: true, isPublished: true, slug: true, revisions: { select: { id: true, revisionNumber: true } } } });
  const revisions = await prisma.articleRevision.count();
  const comments = await prisma.comment.findMany({ select: { id: true, authorName: true, status: true, articleId: true, userId: true } });
  const events = await prisma.event.count();
  const meetups = await prisma.meetup.count();
  const enquiries = await prisma.contactEnquiry.count();
  const auditLogs = await prisma.auditLog.count();
  const settings = await prisma.siteSettings.findFirst();

  console.log(JSON.stringify({
    users,
    admins,
    articlesCount: articles.length,
    articles,
    revisionsCount: revisions,
    commentsCount: comments.length,
    comments,
    eventsCount: events,
    meetupsCount: meetups,
    enquiriesCount: enquiries,
    auditLogsCount: auditLogs,
    settings: {
      siteTitle: settings?.siteTitle,
      gmailNotificationsEnabled: settings?.gmailNotificationsEnabled,
      gmailUser: settings?.gmailUser,
    }
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

