import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyByComment, cacheFollowVerification } from '@/lib/instagram';
import { createServiceClient } from '@/lib/supabase-server';

const ConfirmBody = z.object({
  session_id: z.string().uuid(),
  ig_username: z.string().min(1).max(30),
  code: z.string().regex(/^TD-[A-Z0-9]{5}$/),
});

export async function POST(req: NextRequest) {
  const body = ConfirmBody.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { session_id, ig_username, code } = body.data;
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, dj_id')
    .eq('id', session_id)
    .eq('status', 'active')
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const result = await verifyByComment({
    sessionId: session_id,
    igUsername: ig_username,
    code,
    djId: session.dj_id,
  });

  if (!result.verified) {
    return NextResponse.json(
      { verified: false, error: 'Comment not found yet' },
      { status: 200 }
    );
  }

  const { data: attendee, error: attErr } = await supabase
    .from('attendees')
    .upsert(
      { ig_username: ig_username.toLowerCase() },
      { onConflict: 'ig_username' }
    )
    .select('id')
    .single();

  if (attErr || !attendee) {
    return NextResponse.json({ error: 'Failed to upsert attendee' }, { status: 500 });
  }

  await cacheFollowVerification({
    attendeeId: attendee.id,
    djId: session.dj_id,
    method: 'comment',
  });

  const res = NextResponse.json({ verified: true });
  res.cookies.set('attendee_id', attendee.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
