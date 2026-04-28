import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';

const Body = z.object({
  venue: z.string().max(100).nullable().optional(),
});

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: 'DJ profile not found' }, { status: 404 });
  }

  const { data: existing } = await service
    .from('sessions')
    .select('id')
    .eq('dj_id', dj.id)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Ya tienes una sesión activa. Termínala antes de crear otra.' },
      { status: 409 }
    );
  }

  const { data: created, error } = await service
    .from('sessions')
    .insert({
      dj_id: dj.id,
      venue: body.data.venue ?? null,
      qr_token: randomBytes(8).toString('hex'),
      status: 'active',
      accepting: true,
    })
    .select('id, qr_token')
    .single();

  if (error || !created) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return NextResponse.json({ id: created.id, qr_token: created.qr_token });
}
