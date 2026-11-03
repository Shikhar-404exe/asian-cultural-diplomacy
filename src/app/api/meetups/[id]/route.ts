import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meetup = await prisma.meetup.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!meetup) {
      return NextResponse.json({ error: 'Meetup not found' }, { status: 404 });
    }

    const response = NextResponse.json({ meetup });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error('Meetup GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch meetup' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.meetup.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Meetup not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.date !== undefined) {
      const parsedDate = new Date(body.date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date provided' }, { status: 400 });
      }
      dataToUpdate.date = parsedDate;
    }
    if (body.timeWindow !== undefined) dataToUpdate.timeWindow = body.timeWindow;
    if (body.venue !== undefined) dataToUpdate.venue = body.venue;
    if (body.city !== undefined) dataToUpdate.city = body.city;
    if (body.participationInstructions !== undefined) dataToUpdate.participationInstructions = body.participationInstructions;
    if (body.rsvpLink !== undefined) dataToUpdate.rsvpLink = body.rsvpLink;
    if (body.status !== undefined) dataToUpdate.status = body.status;

    const updated = await prisma.meetup.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    // Invalidate caches
    try {
      revalidatePath('/meetups');
      revalidatePath(`/meetups/${existing.slug}`);
      if (updated.slug !== existing.slug) {
        revalidatePath(`/meetups/${updated.slug}`);
      }
      revalidatePath('/admin/meetups');
      revalidatePath('/');
    } catch (e) {
      console.warn('Cache revalidation error in meetup PUT:', e);
    }

    const response = NextResponse.json({ success: true, meetup: updated });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error('Meetup PUT error:', error);
    return NextResponse.json({ error: 'Failed to update meetup' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.meetup.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Meetup not found' }, { status: 404 });
    }

    await prisma.meetup.delete({ where: { id: existing.id } });

    // Invalidate caches
    try {
      revalidatePath('/meetups');
      revalidatePath(`/meetups/${existing.slug}`);
      revalidatePath('/admin/meetups');
      revalidatePath('/');
    } catch (e) {
      console.warn('Cache revalidation error in meetup DELETE:', e);
    }

    const response = NextResponse.json({ success: true, message: 'Meetup deleted successfully' });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error('Meetup DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete meetup' }, { status: 500 });
  }
}
