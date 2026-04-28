import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase-server';

const Body = z.object({
  action: z.enum(['accept', 'reject', 'mark_played']),
  rejection_reason: z.string().max(120).optional(),
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

  const supabase = createServiceClient();

  const update: Record<string, unknown> = {};
  if (body.data.action === 'accept') {
    update.status = 'accepted';
    update.responded_at = new Date().toISOString();
  } else if (body.data.action === 'reject') {
    update.status = 'rejected';
    update.responded_at = new Date().toISOString();
    update.rejection_reason = body.data.rejection_reason ?? null;
  } else {
    update.status = 'played';
    update.played_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('song_requests')
    .update(update)
    .eq('id', id)
    .select('id, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Update failed' }, { status: 404 });
  }
  return NextResponse.json(data);
}
