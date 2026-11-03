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
    const event = await prisma.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(
      { event },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Event GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title.trim();
    if (body.description !== undefined) dataToUpdate.description = body.description.trim();
    if (body.coverImage !== undefined) dataToUpdate.coverImage = body.coverImage;
    if (body.startDate !== undefined) {
      const d = new Date(body.startDate);
      if (!isNaN(d.getTime())) dataToUpdate.startDate = d;
    }
    if (body.endDate !== undefined) {
      const d = body.endDate ? new Date(body.endDate) : null;
      if (!d || !isNaN(d.getTime())) dataToUpdate.endDate = d;
    }
    if (body.venue !== undefined) dataToUpdate.venue = body.venue.trim();
    if (body.city !== undefined) dataToUpdate.city = body.city.trim();
    if (body.country !== undefined) dataToUpdate.country = body.country.trim();
    if (body.speakers !== undefined) dataToUpdate.speakers = typeof body.speakers === 'string' ? body.speakers : JSON.stringify(body.speakers);
    if (body.agenda !== undefined) dataToUpdate.agenda = typeof body.agenda === 'string' ? body.agenda : JSON.stringify(body.agenda);
    if (body.organizer !== undefined) dataToUpdate.organizer = body.organizer.trim();
    if (body.registrationLink !== undefined) dataToUpdate.registrationLink = body.registrationLink?.trim() || null;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);

    const updated = await prisma.event.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    try {
      revalidatePath('/events');
      revalidatePath(`/events/${updated.slug}`);
      revalidatePath('/admin/events');
      revalidatePath('/admin');
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    console.error('Event PUT error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.event.delete({ where: { id: existing.id } });

    try {
      revalidatePath('/events');
      revalidatePath(`/events/${existing.slug}`);
      revalidatePath('/admin/events');
      revalidatePath('/admin');
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

