import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { validateImageUpload } from '@/lib/security';
import { uploadFile, deleteFile, getStorageProvider } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Administrator privileges required' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validation = validateImageUpload({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name).toLowerCase();
    const safeName = `acd_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;

    // Upload via storage abstraction (Supabase Storage in cloud / local in dev)
    const { url: fileUrl, provider } = await uploadFile(buffer, safeName, file.type);

    const mediaItem = await prisma.mediaItem.create({
      data: {
        originalName: file.name,
        fileName: safeName,
        fileUrl,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      provider,
      media: mediaItem,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process image upload' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const media = await prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      media,
      activeProvider: getStorageProvider(),
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const mediaItem = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from underlying storage
    await deleteFile(mediaItem.fileUrl);

    // Remove from database
    await prisma.mediaItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully from storage and catalog.',
    });
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
