import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prisma } from './prisma';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'asian_cultural_diplomacy_fallback_secret_key_2026'
);

export const SESSION_COOKIE_NAME = 'acd_session_token';
const LEGACY_COOKIE_NAME = 'acd_admin_token';

export type UserRole = 'ADMIN' | 'READER';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}

// Backward-compatibility alias
export type AdminSessionPayload = SessionPayload;

/**
 * Enforces server-side role assignment based on process.env.ADMIN_EMAIL.
 * The administrator role is never selectable by the client during registration.
 */
export function getRoleForEmail(email: string): UserRole {
  const configuredAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (configuredAdmin && email.trim().toLowerCase() === configuredAdmin) {
    return 'ADMIN';
  }
  return 'READER';
}

/**
 * Creates a signed JWT token valid for 7 days
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verifies a JWT token and returns the payload if valid
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves the currently active user session (ADMIN or READER)
 * Supports passing NextRequest directly (for Route Handlers) or falling back
 * safely to next/headers cookies() (for Server Components and Server Actions).
 */
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  // 1. Check NextRequest cookies if passed from a Route Handler
  if (req) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.cookies.get(LEGACY_COOKIE_NAME)?.value;
    if (token) {
      return await verifySessionToken(token);
    }
  }

  // 2. Fall back to Next.js cookies() store safely
  try {
    const cookieStore = await cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get(LEGACY_COOKIE_NAME)?.value;
  } catch (err) {
    // Expected when invoked outside a request store context
  }

  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Retrieves the session ONLY if the authenticated user has the 'ADMIN' role.
 * Readers attempting to authenticate against admin endpoints will receive null.
 */
export async function getAdminSession(req?: NextRequest): Promise<SessionPayload | null> {
  const session = await getSession(req);
  if (!session) return null;
  if (session.role !== 'ADMIN') {
    return null;
  }
  return session;
}

/**
 * Asserts that the current session is an authenticated Administrator.
 * Throws an error otherwise.
 */
export async function requireAdminSession(req?: NextRequest): Promise<SessionPayload> {
  const session = await getAdminSession(req);
  if (!session) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return session;
}

/**
 * Asserts that any valid user is signed in (either ADMIN or READER).
 */
export async function requireSession(req?: NextRequest): Promise<SessionPayload> {
  const session = await getSession(req);
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

/**
 * Sets the authentication session cookie with HTTPOnly, secure, and SameSite protection.
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // Also set legacy cookie during transition
  cookieStore.set(LEGACY_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

/**
 * Clears the session cookies on sign out
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

// Backward-compatibility aliases
export const setAdminSessionCookie = setSessionCookie;
export const clearAdminSessionCookie = clearSessionCookie;
