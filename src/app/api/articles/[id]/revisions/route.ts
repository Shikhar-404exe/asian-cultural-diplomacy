import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const revisions = await prisma.articleRevision.findMany({
      where: { articleId: id },
      orderBy: { revisionNumber: 'desc' },
      take: 30,
      select: {
        id: true,
        revisionNumber: true,
        title: true,
        subtitle: true,
        content: true,
        createdAt: true,
        savedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error('Fetch revisions error:', error);
    return NextResponse.json({ error: 'Failed to retrieve revisions' }, { status: 500 });
  }
}

