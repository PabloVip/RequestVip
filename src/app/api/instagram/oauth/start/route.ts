import { NextRequest, NextResponse } from 'next/server';
import { buildOAuthUrl } from '@/lib/instagram';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const csrf = randomBytes(16).toString('hex');
  const state = Buffer.from(JSON.stringify({ sessionId, csrf })).toString('base64url');

  const url = buildOAuthUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set('ig_oauth_csrf', csrf, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });
  return res;
}
