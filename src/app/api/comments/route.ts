import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { checkRateLimit, sanitizePlainText, hashClientIp } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const articleId = searchParams.get('articleId');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (articleId) {
      where.articleId = articleId;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`comment_${ip}`, 5, 5 * 60 * 1000); // 5 per 5 mins
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You are submitting comments too quickly. Please pause before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { articleId, authorName, authorEmail, content, honeypot } = body;

    // Honeypot bot protection
    if (honeypot) {
      // Spam bot detected silently
      return NextResponse.json(
        { success: true, message: 'Your comment has been received.' },
        { status: 200 }
      );
    }

    if (!articleId || !authorName || !content) {
      return NextResponse.json(
        { error: 'Please provide your name and comment message.' },
        { status: 400 }
      );
    }

    const cleanName = sanitizePlainText(authorName);
    const cleanContent = sanitizePlainText(content);

    if (cleanName.length < 2 || cleanName.length > 70) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 70 characters.' },
        { status: 400 }
      );
    }

    if (cleanContent.length < 5 || cleanContent.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 5 and 2000 characters.' },
        { status: 400 }
      );
    }

    // Verify article exists
    const article = await prisma.article.findFirst({
      where: { OR: [{ id: articleId }, { slug: articleId }] },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        articleId: article.id,
        authorName: cleanName,
        authorEmail: authorEmail ? String(authorEmail).slice(0, 100) : null,
        content: cleanContent,
        status: 'PENDING', // Mandatory moderation queue
        clientIpHash: hashClientIp(ip),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your comment has been submitted and is pending review by the founder.',
      comment: {
        id: comment.id,
        authorName: comment.authorName,
        status: comment.status,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
