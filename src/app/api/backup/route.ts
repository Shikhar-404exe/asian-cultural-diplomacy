import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [articles, categories, comments, events, meetups, enquiries, settings, media] = await Promise.all([
      prisma.article.findMany({ include: { tags: true } }),
      prisma.category.findMany(),
      prisma.comment.findMany(),
      prisma.event.findMany(),
      prisma.meetup.findMany(),
      prisma.contactEnquiry.findMany(),
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.mediaItem.findMany(),
    ]);

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      platform: 'Asian Cultural Diplomacy',
      data: {
        articles,
        categories,
        comments,
        events,
        meetups,
        enquiries,
        settings,
        media,
      },
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="acd_backup_${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

