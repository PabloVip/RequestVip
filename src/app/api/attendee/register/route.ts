import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';

const Body = z.object({
  session_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const body = Body.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, dj_id, status')
    .eq('id', body.data.session_id)
    .single();

  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Session not active' }, { status: 404 });
  }

  const anonHandle = `guest_${randomBytes(4).toString('hex')}`;

  const { data: attendee, error } = await supabase
    .from('attendees')
    .insert({ ig_username: anonHandle })
    .select('id')
    .single();

  if (error || !attendee) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }

  await supabase.from('follow_verifications').insert({
    attendee_id: attendee.id,
    dj_id: session.dj_id,
    method: 'manual',
  });

  const res = NextResponse.json({ ok: true, attendee_id: attendee.id });
  res.cookies.set('attendee_id', attendee.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
