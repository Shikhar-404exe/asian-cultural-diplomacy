import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken, setSessionCookie, getRoleForEmail } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirectUrl = searchParams.get('redirect') || '/account';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/google`;

  // Step 1: If no code received, initiate OAuth redirect to Google accounts
  if (!code) {
    if (!clientId) {
      // If unconfigured locally, provide helpful informative redirect back to login
      return NextResponse.redirect(
        new URL('/login?error=Google+OAuth+is+not+configured+in+environment+variables.+Please+sign+in+with+email+or+set+GOOGLE_CLIENT_ID.', req.url)
      );
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&access_type=offline` +
      `&prompt=select_account`;

    return NextResponse.redirect(googleAuthUrl);
  }

  // Step 2: Handle OAuth code exchange
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return NextResponse.redirect(new URL('/login?error=Failed+to+exchange+Google+authorization+code.', req.url));
    }

    // Fetch user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.email) {
      return NextResponse.redirect(new URL('/login?error=No+email+provided+by+Google+account.', req.url));
    }

    if (!profile.email_verified) {
      return NextResponse.redirect(new URL('/login?error=Google+account+email+is+not+verified+by+Google.', req.url));
    }

    const email = profile.email.toLowerCase().trim();
    const name = profile.name || profile.given_name || 'Reader';
    const googleId = profile.id;
    const avatarUrl = profile.picture || null;

    // Server-enforced role assignment with verified identity guarantee
    const assignedRole = getRoleForEmail(email);

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Update existing user with googleId if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatarUrl: avatarUrl || user.avatarUrl,
          isEmailVerified: true,
          role: assignedRole,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatarUrl,
          role: assignedRole,
          isEmailVerified: true,
          status: 'ACTIVE',
        },
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

    const destination = user.role === 'ADMIN' ? '/admin' : redirectUrl;
    return NextResponse.redirect(new URL(destination, req.url));
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=Google+authentication+failed.', req.url));
  }
}

