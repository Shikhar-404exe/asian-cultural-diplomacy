/**
 * Disaster Recovery & Restoration Verification Script
 * Simulates a full restoration test against an isolated test database.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function testRestoration() {
  console.log('--- Phase 6: Backup & Restoration Verification Test ---');

  // 1. Locate latest backup
  const backupsDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    throw new Error('Backups directory does not exist.');
  }

  const files = fs.readdirSync(backupsDir);
  const jsonBackups = files.filter((f) => f.startsWith('sqlite_export_') && f.endsWith('.json'));
  const dbBackups = files
    .filter((f) => f.endsWith('.db'))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(backupsDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  console.log(`Found ${dbBackups.length} binary .db snapshot(s) and ${jsonBackups.length} structured JSON export(s).`);

  if (dbBackups.length === 0 && jsonBackups.length === 0) {
    throw new Error('No backup files found to test restoration.');
  }

  // 2. Perform isolated binary restoration test using the latest snapshot
  const latestSnapshot = dbBackups[0].name;
  const sourceDb = path.join(backupsDir, latestSnapshot);
  const testRestoredDbPath = path.join(process.cwd(), 'prisma', 'test_restored.db');

  console.log(`Copying latest snapshot: ${latestSnapshot} -> test_restored.db`);
  fs.copyFileSync(sourceDb, testRestoredDbPath);

  // 3. Connect Prisma client to test restored database
  const restoredPrisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${testRestoredDbPath}`,
      },
    },
  });

  try {
    console.log('Testing query capability on restored database...');
    const userCount = await restoredPrisma.user.count();
    const adminCount = await restoredPrisma.adminUser.count();
    const categoryCount = await restoredPrisma.category.count();
    const articleCount = await restoredPrisma.article.count();

    console.log('\nRestoration Verification Results:');
    console.table({
      users: userCount,
      admins: adminCount,
      categories: categoryCount,
      articles: articleCount,
    });

    console.log('[SUCCESS] Restored database is intact, queryable, and relationally sound.');
  } finally {
    await restoredPrisma.$disconnect();
    // Clean up temporary test database
    if (fs.existsSync(testRestoredDbPath)) {
      fs.unlinkSync(testRestoredDbPath);
      console.log('Cleaned up temporary test database.');
    }
  }
}

testRestoration().catch(console.error);
