require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showSettings() {
  const s = await prisma.siteSettings.findFirst();
  console.log('SiteSettings in Supabase PostgreSQL:');
  console.log(JSON.stringify(s, null, 2));
}

showSettings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

