import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession, getSession } from '@/lib/auth';
import { checkRateLimit, sanitizePlainText, hashClientIp } from '@/lib/security';
import { notifyNewComment } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const articleId = searchParams.get('articleId');

    // Admin can inspect moderation queues with status filtering
    const adminSession = await getAdminSession();
    if (!adminSession) {
      // Public / Reader endpoint: only return APPROVED comments for an article
      if (!articleId) {
        return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
      }

      const comments = await prisma.comment.findMany({
        where: {
          articleId,
          status: 'APPROVED',
        },
        select: {
          id: true,
          authorName: true,
          content: true,
          createdAt: true,
          likesCount: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ comments });
    }

    // Admin view
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
        user: {
          select: { id: true, name: true, email: true, role: true },
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
    const rateCheck = checkRateLimit(`comment_${ip}`, 8, 5 * 60 * 1000); // 8 per 5 mins
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You are submitting comments too quickly. Please pause before trying again.' },
        { status: 429 }
      );
    }

    // Enforce authentication requirement
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Please sign in or register to join this dialogue and contribute your perspective.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { articleId, content, honeypot } = body;

    // Honeypot bot protection
    if (honeypot) {
      return NextResponse.json(
        { success: true, message: 'Your comment has been received.' },
        { status: 200 }
      );
    }

    if (!articleId || !content) {
      return NextResponse.json(
        { error: 'Please provide your comment message.' },
        { status: 400 }
      );
    }

    const cleanContent = sanitizePlainText(content);

    if (cleanContent.length < 3 || cleanContent.length > 2500) {
      return NextResponse.json(
        { error: 'Comment must be between 3 and 2500 characters.' },
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

    // Role-based status: Founder admin comments are automatically approved; readers are queued for civility review
    const commentStatus = session.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

    const comment = await prisma.comment.create({
      data: {
        articleId: article.id,
        userId: session.userId,
        authorName: session.name,
        authorEmail: session.email,
        content: cleanContent,
        status: commentStatus,
        clientIpHash: hashClientIp(ip),
      },
    });

    // Notify founder asynchronously
    notifyNewComment(article.title, session.name, cleanContent, comment.id).catch(err => {
      console.warn('Comment notification error:', err?.message || err);
    });

    return NextResponse.json({
      success: true,
      message: session.role === 'ADMIN' 
        ? 'Your editorial comment has been published.' 
        : 'Thank you! Your perspective has been received and is pending review by the founder.',
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
