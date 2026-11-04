import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.redirect(
    new URL('/login?notice=Please+sign+in+directly+with+your+registered+email+and+password.', req.url)
  );
}
