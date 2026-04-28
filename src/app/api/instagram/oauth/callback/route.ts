import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForProfile,
  cacheFollowVerification,
} from '@/lib/instagram';
import { createServiceClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${url.origin}/auth-error?reason=${error}`);
  }
  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  let parsed: { sessionId: string; csrf: string };
  try {
    parsed = JSON.parse(Buffer.from(state, 'base64url').toString());
  } catch {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  const cookieCsrf = req.cookies.get('ig_oauth_csrf')?.value;
  if (!cookieCsrf || cookieCsrf !== parsed.csrf) {
    return NextResponse.json({ error: 'CSRF mismatch' }, { status: 403 });
  }

  const profile = await exchangeCodeForProfile(code);
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, dj_id')
    .eq('id', parsed.sessionId)
    .eq('status', 'active')
    .single();

  if (!session) {
    return NextResponse.redirect(`${url.origin}/session-not-found`);
  }

  const { data: attendee, error: attErr } = await supabase
    .from('attendees')
    .upsert(
      {
        ig_username: profile.username.toLowerCase(),
        ig_user_id: profile.igUserId,
      },
      { onConflict: 'ig_username' }
    )
    .select('id')
    .single();

  if (attErr || !attendee) {
    return NextResponse.json({ error: 'Failed to create attendee' }, { status: 500 });
  }

  await cacheFollowVerification({
    attendeeId: attendee.id,
    djId: session.dj_id,
    method: 'oauth',
  });

  const res = NextResponse.redirect(
    `${url.origin}/s/${parsed.sessionId}?verified=1`
  );
  res.cookies.set('attendee_id', attendee.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.delete('ig_oauth_csrf');
  return res;
}
