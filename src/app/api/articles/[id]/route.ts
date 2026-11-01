import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { slugify, estimateReadingTime } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();

    const article = await prisma.article.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        comments: {
          where: session ? undefined : { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (!article.isPublished && !session) {
      return NextResponse.json({ error: 'Article not published' }, { status: 403 });
    }

    // Increment views asynchronously
    await prisma.article.update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Article GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, subtitle, coverImage, content, categoryId, isPublished, isFeatured, author } = body;

    const existing = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (subtitle !== undefined) dataToUpdate.subtitle = subtitle;
    if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
    if (content !== undefined) {
      dataToUpdate.content = content;
      dataToUpdate.readingTime = estimateReadingTime(content);
    }
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (author !== undefined) dataToUpdate.author = author;
    if (isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(isFeatured);

    if (isPublished !== undefined) {
      const willPublish = Boolean(isPublished);
      dataToUpdate.isPublished = willPublish;
      if (willPublish && !existing.publishedAt) {
        dataToUpdate.publishedAt = new Date();
      }
    }

    const updated = await prisma.article.update({
      where: { id: existing.id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error('Article PUT error:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await prisma.article.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Article DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
