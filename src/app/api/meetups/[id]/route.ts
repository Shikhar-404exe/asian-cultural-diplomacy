import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

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

    return NextResponse.json({ meetup });
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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    if (body.date !== undefined) dataToUpdate.date = new Date(body.date);
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

    return NextResponse.json({ success: true, meetup: updated });
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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.meetup.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Meetup not found' }, { status: 404 });
    }

    await prisma.meetup.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: 'Meetup deleted successfully' });
  } catch (error) {
    console.error('Meetup DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete meetup' }, { status: 500 });
  }
}

