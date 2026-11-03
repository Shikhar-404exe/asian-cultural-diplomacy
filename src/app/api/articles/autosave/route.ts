import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const body = await req.json();
    const { articleId, title, subtitle, categoryId, coverImage, content, isPublished, isFeatured } = body;

    if (!title && !content) {
      return NextResponse.json({ error: 'Title or content required for autosave' }, { status: 400 });
    }

    const cleanTitle = title?.trim() || 'Untitled Perspective Draft';
    const cleanContent = content || '<p></p>';

    // Fallback category if none selected
    let targetCategoryId = categoryId;
    if (!targetCategoryId) {
      const defaultCategory = await prisma.category.findFirst();
      if (defaultCategory) {
        targetCategoryId = defaultCategory.id;
      } else {
        const newCat = await prisma.category.create({
          data: { name: 'Cultural Commentary', slug: 'cultural-commentary' },
        });
        targetCategoryId = newCat.id;
      }
    }

    let article;

    if (articleId) {
      // Update existing article draft
      article = await prisma.article.findUnique({
        where: { id: articleId },
        include: { revisions: { orderBy: { revisionNumber: 'desc' }, take: 1 } },
      });

      if (!article) {
        return NextResponse.json({ error: 'Article not found for autosave' }, { status: 404 });
      }

      const latestRevision = article.revisions[0];
      const hasContentChanged = !latestRevision || latestRevision.content !== cleanContent || latestRevision.title !== cleanTitle;

      article = await prisma.article.update({
        where: { id: articleId },
        data: {
          title: cleanTitle,
          subtitle: subtitle?.trim() || null,
          categoryId: targetCategoryId,
          coverImage: coverImage || null,
          content: cleanContent,
          isPublished: isPublished !== undefined ? isPublished : article.isPublished,
          isFeatured: isFeatured !== undefined ? isFeatured : article.isFeatured,
          lastAutosavedAt: new Date(),
        },
      });

      // Save a revision if content meaningfully changed
      if (hasContentChanged) {
        const nextRevNumber = (latestRevision?.revisionNumber || 0) + 1;
        await prisma.articleRevision.create({
          data: {
            articleId: article.id,
            revisionNumber: nextRevNumber,
            title: cleanTitle,
            subtitle: subtitle?.trim() || null,
            content: cleanContent,
            savedById: session.userId,
          },
        });
      }
    } else {
      // Create new draft article on server
      const baseSlug = generateSlug(cleanTitle);
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      article = await prisma.article.create({
        data: {
          title: cleanTitle,
          slug: uniqueSlug,
          subtitle: subtitle?.trim() || null,
          categoryId: targetCategoryId,
          coverImage: coverImage || '/art/founder-sister-bridge.jpg',
          content: cleanContent,
          isPublished: false,
          isFeatured: isFeatured || false,
          author: session.name,
          lastAutosavedAt: new Date(),
        },
      });

      // Create initial revision #1
      await prisma.articleRevision.create({
        data: {
          articleId: article.id,
          revisionNumber: 1,
          title: cleanTitle,
          subtitle: subtitle?.trim() || null,
          content: cleanContent,
          savedById: session.userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      articleId: article.id,
      slug: article.slug,
      lastAutosavedAt: article.lastAutosavedAt,
      message: 'Draft securely autosaved to server cloud.',
    });
  } catch (error) {
    console.error('Autosave error:', error);
    return NextResponse.json({ error: 'Server autosave failed' }, { status: 500 });
  }
}

