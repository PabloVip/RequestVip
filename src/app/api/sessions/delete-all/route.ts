import { NextResponse } from 'next/server';
import { createServiceClient, createUserClient } from '@/lib/supabase-server';

export async function DELETE() {
  try {
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

    const { data: sessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('dj_id', dj.id);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }

    const sessionIds = sessions.map(s => s.id);

    await supabase.from('song_requests').delete().in('session_id', sessionIds);
    await supabase.from('attendee_cooldowns').delete().in('session_id', sessionIds);

    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('dj_id', dj.id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, deleted: sessionIds.length });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
