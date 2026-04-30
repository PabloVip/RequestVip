import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient, createUserClient } from '@/lib/supabase-server';

const Body = z.object({
  action: z.enum(['accept', 'reject', 'mark_played']),
  rejection_reason: z.string().max(200).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rawBody = await req.json();
    console.log('PATCH /api/requests/[id] called', { id, rawBody });

    const body = Body.safeParse(rawBody);
    if (!body.success) {
      console.error('Invalid body:', body.error);
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const userClient = await createUserClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    const { data: dj, error: djError } = await supabase
      .from('djs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (djError || !dj) {
      console.error('DJ lookup failed:', djError);
      return NextResponse.json({ error: 'DJ profile not found' }, { status: 403 });
    }

    const { data: request, error: reqError } = await supabase
      .from('song_requests')
      .select('id, session_id, status')
      .eq('id', id)
      .single();

    if (reqError || !request) {
      console.error('Request lookup failed:', reqError);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { data: session, error: sessError } = await supabase
      .from('sessions')
      .select('dj_id')
      .eq('id', request.session_id)
      .single();

    if (sessError || !session) {
      console.error('Session lookup failed:', sessError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.dj_id !== dj.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let nextStatus: string;
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { status: '' };

    if (body.data.action === 'accept') {
      if (request.status !== 'pending') {
        return NextResponse.json({ error: 'Cannot accept this request' }, { status: 409 });
      }
      nextStatus = 'accepted';
      updates.responded_at = now;
    } else if (body.data.action === 'reject') {
      if (request.status !== 'pending') {
        return NextResponse.json({ error: 'Cannot reject this request' }, { status: 409 });
      }
      nextStatus = 'rejected';
      updates.responded_at = now;
      if (body.data.rejection_reason) {
        updates.rejection_reason = body.data.rejection_reason;
      }
    } else {
      if (request.status !== 'accepted') {
        return NextResponse.json({ error: 'Only accepted requests can be marked as played' }, { status: 409 });
      }
      nextStatus = 'played';
      updates.played_at = now;
    }

    updates.status = nextStatus;
    console.log('About to update with:', updates);

    const { data: updated, error: updateError } = await supabase
      .from('song_requests')
      .update(updates)
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('UPDATE FAILED:', JSON.stringify(updateError));
      return NextResponse.json({
        error: 'Failed to update',
        details: updateError.message,
        hint: updateError.hint,
        code: updateError.code,
      }, { status: 500 });
    }

    console.log('Update successful:', updated);
    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (e) {
    console.error('Unexpected error:', e);
    return NextResponse.json({
      error: 'Internal error',
      details: e instanceof Error ? e.message : 'unknown',
    }, { status: 500 });
  }
}
