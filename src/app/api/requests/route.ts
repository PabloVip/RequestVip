import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAudioFeatures } from '@/lib/spotify';
import { createServiceClient } from '@/lib/supabase-server';

const Body = z.object({
  session_id: z.string().uuid(),
  spotify_track_id: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(200),
  album_art_url: z.string().url().nullable().optional(),
  duration_ms: z.number().int().positive().optional(),
  explicit: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = Body.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const attendeeId = req.cookies.get('attendee_id')?.value;
  if (!attendeeId) {
    return NextResponse.json({ error: 'Not registered' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, dj_id, status, accepting')
    .eq('id', body.data.session_id)
    .single();

  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Session not active' }, { status: 404 });
  }
  if (!session.accepting) {
    return NextResponse.json(
      { error: 'DJ no está aceptando peticiones ahora' },
      { status: 423 }
    );
  }

  const { data: prefs } = await supabase
    .from('dj_preferences')
    .select('*')
    .eq('dj_id', session.dj_id)
    .single();

  const cooldownMs = (prefs?.cooldown_seconds ?? 300) * 1000;
  const maxRequests = prefs?.max_requests_per_user ?? 5;

  if (prefs?.reject_explicit && body.data.explicit) {
    return NextResponse.json(
      { error: 'El DJ no acepta canciones explícitas' },
      { status: 422 }
    );
  }

  if (prefs?.auto_reject_blacklist && (prefs.blacklist_terms?.length ?? 0) > 0) {
    const haystack = `${body.data.title} ${body.data.artist}`.toLowerCase();
    const matched = prefs.blacklist_terms.find((term: string) =>
      haystack.includes(term.toLowerCase())
    );
    if (matched) {
      return NextResponse.json(
        { error: `El DJ no acepta este tipo de música esta noche` },
        { status: 422 }
      );
    }
  }

  const { data: cooldown } = await supabase
    .from('attendee_cooldowns')
    .select('last_request_at, request_count')
    .eq('attendee_id', attendeeId)
    .eq('session_id', session.id)
    .maybeSingle();

  if (cooldown) {
    if (cooldown.request_count >= maxRequests) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de peticiones para esta sesión' },
        { status: 429 }
      );
    }
    const elapsed = Date.now() - new Date(cooldown.last_request_at).getTime();
    if (elapsed < cooldownMs) {
      const wait = Math.ceil((cooldownMs - elapsed) / 1000);
      const waitLabel = wait >= 60 ? `${Math.ceil(wait / 60)} min` : `${wait}s`;
      return NextResponse.json(
        { error: `Espera ${waitLabel} antes de pedir otra canción` },
        { status: 429 }
      );
    }
  }

  const { data: existing } = await supabase
    .from('song_requests')
    .select('id')
    .eq('session_id', session.id)
    .eq('spotify_track_id', body.data.spotify_track_id)
    .in('status', ['pending', 'accepted'])
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'Esta canción ya está en la cola' },
      { status: 409 }
    );
  }

  const features = await getAudioFeatures(body.data.spotify_track_id).catch(() => ({
    bpm: null,
    key: null,
    energy: null,
  }));

  const { data: created, error: insertErr } = await supabase
    .from('song_requests')
    .insert({
      session_id: session.id,
      attendee_id: attendeeId,
      spotify_track_id: body.data.spotify_track_id,
      title: body.data.title,
      artist: body.data.artist,
      album_art_url: body.data.album_art_url,
      duration_ms: body.data.duration_ms,
      bpm: features.bpm,
      key_signature: features.key,
      energy: features.energy,
    })
    .select('id, created_at, status')
    .single();

  if (insertErr || !created) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }

  await supabase.from('attendee_cooldowns').upsert(
    {
      attendee_id: attendeeId,
      session_id: session.id,
      last_request_at: new Date().toISOString(),
      request_count: (cooldown?.request_count ?? 0) + 1,
    },
    { onConflict: 'attendee_id,session_id' }
  );

  return NextResponse.json({
    id: created.id,
    status: created.status,
    created_at: created.created_at,
  });
}
