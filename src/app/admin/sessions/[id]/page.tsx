import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import RequestsChart from './requests-chart';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createUserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const service = createServiceClient();

  const { data: dj } = await service
    .from('djs')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!dj) redirect('/admin');

  const { data: session } = await service
    .from('sessions')
    .select('id, venue, status, started_at, ended_at, dj_id')
    .eq('id', id)
    .single();

  if (!session || session.dj_id !== dj.id) notFound();

  const { data: requests } = await service
    .from('song_requests')
    .select('id, title, artist, album_art_url, status, created_at, attendee_id, rejection_reason')
    .eq('session_id', id)
    .order('created_at', { ascending: false });

  const list = requests ?? [];

  const accepted = list.filter(r => r.status === 'accepted' || r.status === 'played').length;
  const rejected = list.filter(r => r.status === 'rejected').length;
  const played   = list.filter(r => r.status === 'played').length;
  const acceptanceRate = list.length > 0 ? Math.round((accepted / list.length) * 100) : 0;

  const trackCount = new Map<string, { title: string; artist: string; count: number; albumArt: string | null }>();
  for (const r of list) {
    const key = `${r.title}|${r.artist}`;
    const existing = trackCount.get(key);
    if (existing) {
      existing.count++;
    } else {
      trackCount.set(key, { title: r.title, artist: r.artist, count: 1, albumArt: r.album_art_url });
    }
  }
  const topTracks = Array.from(trackCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const requesterCount = new Map<string, number>();
  for (const r of list) {
    requesterCount.set(r.attendee_id, (requesterCount.get(r.attendee_id) ?? 0) + 1);
  }
  const topRequesters = Array.from(requesterCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const buckets: { hour: string; count: number }[] = [];
  if (list.length > 0) {
    const start = new Date(session.started_at).getTime();
    const end = session.ended_at ? new Date(session.ended_at).getTime() : Date.now();
    const hourMs = 60 * 60 * 1000;

    const startHour = Math.floor(start / hourMs) * hourMs;
    const endHour = Math.ceil(end / hourMs) * hourMs;

    for (let t = startHour; t < endHour; t += hourMs) {
      const bucketStart = t;
      const bucketEnd = t + hourMs;
      const count = list.filter(r => {
        const time = new Date(r.created_at).getTime();
        return time >= bucketStart && time < bucketEnd;
      }).length;
      buckets.push({
        hour: new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        count,
      });
    }
  }

  const duration = session.ended_at
    ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
    : null;

  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '1.5rem',
    }}>
      <Link
        href="/admin/sessions"
        style={{ color: '#888', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block' }}
      >
        ← Historial
      </Link>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>
          {session.venue ?? 'Sesión sin nombre'}
        </h1>
        <p style={{ color: '#888', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {new Date(session.started_at).toLocaleString('es-ES')}
          {duration !== null && ` · ${duration} min`}
        </p>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginBottom: '2rem',
      }}>
        <Stat label="Total" value={list.length} />
        <Stat label="Aceptadas" value={accepted} />
        <Stat label="Sonadas" value={played} />
        <Stat label="Aceptación" value={`${acceptanceRate}%`} />
      </section>

      {buckets.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Peticiones por hora
          </h2>
          <RequestsChart buckets={buckets} />
        </section>
      )}

      {topTracks.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Más pedidas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topTracks.map((track, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '0.75rem',
                borderRadius: '8px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: '#2a2a2a',
                  borderRadius: '4px',
                  flexShrink: 0,
                  backgroundImage: track.albumArt ? `url(${track.albumArt})` : undefined,
                  backgroundSize: 'cover',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{track.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#888' }}>{track.artist}</p>
                </div>
                <span style={{
                  background: '#2a2a2a',
                  color: '#aaa',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}>
                  ×{track.count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {list.length > 0 && (
        <section>
          <h2 style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Todas las peticiones ({list.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {list.map(r => (
              <div key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '0.625rem 0.75rem',
                borderRadius: '8px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#2a2a2a',
                  borderRadius: '4px',
                  flexShrink: 0,
                  backgroundImage: r.album_art_url ? `url(${r.album_art_url})` : undefined,
                  backgroundSize: 'cover',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{r.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#888' }}>{r.artist}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {list.length === 0 && (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
          No hubo peticiones en esta sesión
        </p>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '0.75rem', borderRadius: '8px' }}>
      <p style={{ fontSize: '0.6875rem', color: '#888' }}>{label}</p>
      <p style={{ fontSize: '1.25rem', fontWeight: 500, marginTop: '0.125rem' }}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    pending:  { color: '#fbbf24', bg: '#3a2a00', label: 'Pendiente' },
    accepted: { color: '#34d399', bg: '#0a3320', label: 'Aceptada' },
    played:   { color: '#a78bfa', bg: '#1a0a3a', label: 'Sonada' },
    rejected: { color: '#f87171', bg: '#3a0a0a', label: 'Rechazada' },
    expired:  { color: '#888',    bg: '#222',    label: 'Expirada' },
  };
  const c = config[status] ?? config.pending;
  return (
    <span style={{
      fontSize: '0.6875rem',
      color: c.color,
      background: c.bg,
      padding: '0.25rem 0.5rem',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
