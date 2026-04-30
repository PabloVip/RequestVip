import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createUserClient } from '@/lib/supabase-server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { data: session } = await supabase
      .from('sessions')
      .select('id, dj_id')
      .eq('id', id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.dj_id !== dj.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await supabase.from('song_requests').delete().eq('session_id', id);
    await supabase.from('attendee_cooldowns').delete().eq('session_id', id);

    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
