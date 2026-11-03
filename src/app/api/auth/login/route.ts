import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSessionToken, setSessionCookie, getRoleForEmail } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`login_${ip}`, 10, 15 * 60 * 1000); // 10 attempts per 15 min
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Look up user in unified User table
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Fallback sync for existing AdminUser records if not yet in User table
    if (!user) {
      const legacyAdmin = await prisma.adminUser.findUnique({
        where: { email: cleanEmail },
      });
      if (legacyAdmin) {
        user = await prisma.user.create({
          data: {
            id: legacyAdmin.id,
            email: legacyAdmin.email,
            name: legacyAdmin.name,
            passwordHash: legacyAdmin.passwordHash,
            role: 'ADMIN',
            isEmailVerified: true,
            status: 'ACTIVE',
          },
        });
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Determine role strictly on server
    const targetRole = getRoleForEmail(user.email);
    if (user.role !== targetRole) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: targetRole },
      });
    }

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
        avatarUrl: user.avatarUrl,
      },
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/account',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
