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
  const { id } = await params;
  const body = Body.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const userClient = await createUserClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: dj } = await supabase
    .from('djs')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dj) {
    return NextResponse.json({ error: 'DJ profile not found' }, { status: 403 });
  }

  const { data: request } = await supabase
    .from('song_requests')
    .select('id, session_id, status, sessions(dj_id)')
    .eq('id', id)
    .single();

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const session = request.sessions as unknown as { dj_id: string } | null;
  if (!session || session.dj_id !== dj.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let nextStatus: string;
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {};

  if (body.data.action === 'accept') {
    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot accept this request' }, { status: 409 });
    }
    nextStatus = 'accepted';
    updates.accepted_at = now;
  } else if (body.data.action === 'reject') {
    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot reject this request' }, { status: 409 });
    }
    nextStatus = 'rejected';
    updates.rejected_at = now;
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

  const { error: updateError } = await supabase
    .from('song_requests')
    .update({ status: nextStatus, ...updates })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: nextStatus });
}
