import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

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

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (!title || !description || !startDate || !venue || !city || !country) {
      return NextResponse.json(
        { error: 'Title, description, start date, venue, city, and country are required.' },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        coverImage: coverImage || '/images/fuji-sakura.jpg',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        venue,
        city,
        country,
        speakers: typeof speakers === 'string' ? speakers : JSON.stringify(speakers || []),
        agenda: typeof agenda === 'string' ? agenda : JSON.stringify(agenda || []),
        organizer: organizer || 'Asian Cultural Diplomacy',
        registrationLink: registrationLink || null,
        status: status || 'UPCOMING',
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('Event POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
