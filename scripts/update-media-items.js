const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMedia() {
  console.log('Updating MediaItem records in Supabase PostgreSQL...');

  await prisma.mediaItem.deleteMany({
    where: {
      fileName: { in: ['founder-sister-bridge.jpg', 'founder-sister-courtyard.jpg', 'moon-bridge.jpg', 'courtyard-pavilion.jpg'] }
    }
  });

  const newItems = [
    {
      originalName: 'moon-bridge.jpg',
      fileName: 'moon-bridge.jpg',
      fileUrl: '/art/moon-bridge.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 46027,
    },
    {
      originalName: 'courtyard-pavilion.jpg',
      fileName: 'courtyard-pavilion.jpg',
      fileUrl: '/art/courtyard-pavilion.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 79780,
    },
  ];

  for (const item of newItems) {
    await prisma.mediaItem.create({ data: item });
  }

  const allMedia = await prisma.mediaItem.findMany();
  console.log('Current Media Items:', allMedia);
}

updateMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

