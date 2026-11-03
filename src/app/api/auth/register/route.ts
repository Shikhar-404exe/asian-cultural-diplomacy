import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken, setSessionCookie, getRoleForEmail } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security';
import { notifyNewReaderRegistration } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 15 * 60 * 1000); // 5 per 15 min
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid display name (at least 2 characters).' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Prevent public registration using configured administrator email
    const configuredAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (configuredAdmin && cleanEmail === configuredAdmin) {
      return NextResponse.json(
        { error: 'The administrator account is provisioned privately and cannot be created through public registration.' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    // Public registration strictly and unconditionally assigns READER role
    const assignedRole = 'READER';

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role: assignedRole,
        isEmailVerified: false,
        status: 'ACTIVE',
      },
    });

    // Notify founder asynchronously (will not fail registration if Gmail is unconfigured)
    notifyNewReaderRegistration(cleanName, cleanEmail).catch(err => {
      console.warn('Reader registration notification error:', err?.message || err);
    });

    // Automatically sign the new user in
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'READER',
      avatarUrl: user.avatarUrl,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/account',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to complete registration' }, { status: 500 });
  }
}

