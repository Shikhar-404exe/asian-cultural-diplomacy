import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { checkRateLimit, sanitizePlainText } from '@/lib/security';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await prisma.contactEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('Enquiries GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`contact_${ip}`, 3, 10 * 60 * 1000); // 3 per 10 mins
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You have submitted multiple enquiries recently. Please wait a few moments.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message, honeypot } = body;

    // Honeypot trap
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const cleanName = sanitizePlainText(name);
    const cleanEmail = sanitizePlainText(email);
    const cleanSubject = subject ? sanitizePlainText(subject) : 'General Inquiry';
    const cleanMessage = sanitizePlainText(message);

    if (cleanName.length < 2 || cleanName.length > 80) {
      return NextResponse.json({ error: 'Name must be between 2 and 80 characters.' }, { status: 400 });
    }
    if (!cleanEmail.includes('@') || cleanEmail.length > 100) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
      return NextResponse.json({ error: 'Message must be between 10 and 3000 characters.' }, { status: 400 });
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. Your enquiry has been received by the Asian Cultural Diplomacy team.',
      enquiryId: enquiry.id,
    });
  } catch (error) {
    console.error('Enquiry POST error:', error);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}
