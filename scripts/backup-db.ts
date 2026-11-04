import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `pre_cleanup_backup_${timestamp}.json`);

  const users = await prisma.user.findMany();
  const adminUsers = await prisma.adminUser.findMany();
  const categories = await prisma.category.findMany();
  const articles = await prisma.article.findMany({ include: { tags: true, revisions: true } });
  const events = await prisma.event.findMany();
  const meetups = await prisma.meetup.findMany();
  const enquiries = await prisma.contactEnquiry.findMany();
  const comments = await prisma.comment.findMany();
  const mediaItems = await prisma.mediaItem.findMany();
  const siteSettings = await prisma.siteSettings.findMany();
  const auditLogs = await prisma.auditLog.findMany();

  const data = {
    exportedAt: new Date().toISOString(),
    users,
    adminUsers,
    categories,
    articles,
    events,
    meetups,
    enquiries,
    comments,
    mediaItems,
    siteSettings,
    auditLogs,
  };

  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Snapshot backup successfully created: ${backupFile}`);
}

backup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

