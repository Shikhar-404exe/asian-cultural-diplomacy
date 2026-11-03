import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const meetups = await prisma.meetup.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const response = NextResponse.json({ meetups });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error('Meetups GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch meetups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      date,
      timeWindow,
      venue,
      city,
      participationInstructions,
      rsvpLink,
      status,
    } = body;

    if (!title || !description || !date || !timeWindow || !venue || !city || !participationInstructions) {
      return NextResponse.json(
        { error: 'All fields (title, description, date, time window, venue, city, instructions) are required.' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date provided.' },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    const existing = await prisma.meetup.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const meetup = await prisma.meetup.create({
      data: {
        title,
        slug,
        description,
        date: parsedDate,
        timeWindow,
        venue,
        city,
        participationInstructions,
        rsvpLink: rsvpLink || null,
        status: status || 'UPCOMING',
      },
    });

    // Invalidate caches
    try {
      revalidatePath('/meetups');
      revalidatePath(`/meetups/${meetup.slug}`);
      revalidatePath('/admin/meetups');
      revalidatePath('/');
    } catch (e) {
      console.warn('Cache revalidation error in meetups POST:', e);
    }

    const response = NextResponse.json({ success: true, meetup }, { status: 201 });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error: any) {
    console.error('Meetup POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create meetup' }, { status: 500 });
  }
}
