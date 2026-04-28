import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';

const Body = z.object({
  action: z.enum(['pause', 'resume', 'end']),
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

  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: dj } = await service
    .from('djs')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dj) {
    return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
  }

  const { data: session } = await service
    .from('sessions')
    .select('id, dj_id')
    .eq('id', id)
    .single();

  if (!session || session.dj_id !== dj.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const update: Record<string, unknown> = {};
  if (body.data.action === 'pause') {
    update.accepting = false;
  } else if (body.data.action === 'resume') {
    update.accepting = true;
  } else {
    update.status = 'ended';
    update.ended_at = new Date().toISOString();
    update.accepting = false;
  }

  const { error } = await service
    .from('sessions')
    .update(update)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
