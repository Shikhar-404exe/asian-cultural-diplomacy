import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { slugify, estimateReadingTime } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    // If requesting drafts, verify admin session
    if (includeDrafts) {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized to view drafts' }, { status: 401 });
      }
    }

    const where: any = {};
    if (!includeDrafts) {
      where.isPublished = true;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subtitle: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { status: 'APPROVED' } } } },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Articles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, subtitle, coverImage, content, categoryId, isPublished, isFeatured, author } = body;

    if (!title || !categoryId || !content) {
      return NextResponse.json(
        { error: 'Title, category, and content are required' },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    // Ensure slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const readingTime = estimateReadingTime(content);

    const article = await prisma.article.create({
      data: {
        title,
        subtitle: subtitle || null,
        slug,
        coverImage: coverImage || '/art/founder-sister-bridge.jpg',
        content,
        categoryId,
        author: author || session.name || 'Founder & Director',
        isPublished: Boolean(isPublished),
        isFeatured: Boolean(isFeatured),
        readingTime,
        publishedAt: isPublished ? new Date() : null,
        lastAutosavedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    // Record initial revision
    try {
      await prisma.articleRevision.create({
        data: {
          articleId: article.id,
          revisionNumber: 1,
          title: article.title,
          subtitle: article.subtitle,
          content: article.content,
          savedById: session.userId,
        },
      });
    } catch (revErr) {
      console.warn('Initial revision creation warning:', revErr);
    }

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error) {
    console.error('Article creation error:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

