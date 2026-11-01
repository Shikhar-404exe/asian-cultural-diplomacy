import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/security';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const rateCheck = checkRateLimit(`like_${id}_${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Please wait before liking again' }, { status: 429 });
    }

    const article = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const updated = await prisma.article.update({
      where: { id: article.id },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    });

    return NextResponse.json({ success: true, likesCount: updated.likesCount });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to record like' }, { status: 500 });
  }
}
