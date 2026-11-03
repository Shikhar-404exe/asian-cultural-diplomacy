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
    const upcomingOnly = searchParams.get('upcoming') === 'true';

    const where: any = {};
    if (status) {
      where.status = status;
    } else if (upcomingOnly) {
      where.status = { in: ['UPCOMING', 'ONGOING'] };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { startDate: upcomingOnly ? 'asc' : 'desc' },
      ],
    });

    return NextResponse.json(
      { events },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      coverImage,
      startDate,
      endDate,
      venue,
      city,
      country,
      speakers,
      agenda,
      organizer,
      registrationLink,
      status,
      isFeatured,
    } = body;

    if (!title?.trim() || !description?.trim() || !startDate || !venue?.trim() || !city?.trim() || !country?.trim()) {
      return NextResponse.json(
        { error: 'Title, description, start date, venue, city, and country are required.' },
        { status: 400 }
      );
    }

    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start date format' }, { status: 400 });
    }

    let parsedEndDate: Date | null = null;
    if (endDate) {
      const d = new Date(endDate);
      if (!isNaN(d.getTime())) parsedEndDate = d;
    }

    let slug = slugify(title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        slug,
        description: description.trim(),
        coverImage: coverImage || '/images/fuji-sakura.jpg',
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        venue: venue.trim(),
        city: city.trim(),
        country: country.trim(),
        speakers: typeof speakers === 'string' ? speakers : JSON.stringify(speakers || []),
        agenda: typeof agenda === 'string' ? agenda : JSON.stringify(agenda || []),
        organizer: organizer?.trim() || 'Asian Cultural Diplomacy',
        registrationLink: registrationLink?.trim() || null,
        status: status || 'UPCOMING',
        isFeatured: Boolean(isFeatured),
      },
    });

    try {
      revalidatePath('/events');
      revalidatePath(`/events/${event.slug}`);
      revalidatePath('/admin/events');
      revalidatePath('/admin');
      revalidatePath('/');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('Event POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

