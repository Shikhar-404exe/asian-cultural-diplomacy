require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const allArticles = await prisma.article.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Total articles in DB: ${allArticles.length}`);
  for (const a of allArticles) {
    console.log(`  - [Published: ${a.isPublished}] (ID: ${a.id}) "${a.title}" (Category: ${a.category?.name})`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

