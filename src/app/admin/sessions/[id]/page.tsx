import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import RequestsChart from './requests-chart';
import ThemeToggle from '@/components/theme-toggle';

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
      maxWidth: '720px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <Link href="/admin/sessions" style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}>
          ← Historial
        </Link>
        <ThemeToggle />
      </div>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 500,
          letterSpacing: '-0.025em',
        }}>
          {session.venue ?? 'Sesión sin nombre'}
        </h1>
        <p style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          marginTop: '0.25rem',
        }}>
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
        <Stat label="Aceptación" value={`${acceptanceRate}%`} accent />
      </section>

      {buckets.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={sectionLabelStyle}>Peticiones por hora</h2>
          <RequestsChart buckets={buckets} />
        </section>
      )}

      {topTracks.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={sectionLabelStyle}>Más pedidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {topTracks.map((track, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                background: 'var(--bg-subtle)',
                border: '0.5px solid var(--border-subtle)',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--bg-muted)',
                  borderRadius: '6px',
                  flexShrink: 0,
                  backgroundImage: track.albumArt ? `url(${track.albumArt})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}>
                    {track.title}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fg-subtle)' }}>{track.artist}</p>
                </div>
                <span style={{
                  background: 'var(--bg-muted)',
                  color: 'var(--fg)',
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
          <h2 style={sectionLabelStyle}>Todas las peticiones ({list.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {list.map(r => (
              <div key={r.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--bg-subtle)',
                border: '0.5px solid var(--border-subtle)',
                padding: '0.625rem 0.75rem',
                borderRadius: '10px',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--bg-muted)',
                  borderRadius: '5px',
                  flexShrink: 0,
                  backgroundImage: r.album_art_url ? `url(${r.album_art_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}>
                    {r.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>{r.artist}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {list.length === 0 && (
        <p style={{
          color: 'var(--fg-subtle)',
          textAlign: 'center',
          padding: '2rem',
        }}>
          No hubo peticiones en esta sesión
        </p>
      )}
    </main>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--fg-subtle)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.75rem',
  fontWeight: 500,
};

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '0.5px solid var(--border-subtle)',
      padding: '0.875rem 1rem',
      borderRadius: '10px',
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>{label}</p>
      <p style={{
        fontSize: '1.5rem',
        fontWeight: 500,
        marginTop: '0.25rem',
        letterSpacing: '-0.02em',
        color: accent ? 'var(--accent-soft-fg)' : 'var(--fg)',
      }}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; border: string; label: string }> = {
    pending:  { color: 'var(--warning-fg)', bg: 'var(--warning-bg)', border: 'var(--warning-border)', label: 'Pendiente' },
    accepted: { color: 'var(--accent-soft-fg)', bg: 'var(--accent-soft)', border: 'var(--accent-border)', label: 'Aceptada' },
    played:   { color: 'var(--accent-soft-fg)', bg: 'var(--accent-soft)', border: 'var(--accent-border)', label: 'Sonada' },
    rejected: { color: 'var(--danger-fg)', bg: 'var(--danger-bg)', border: 'var(--danger-border)', label: 'Rechazada' },
    expired:  { color: 'var(--fg-subtle)', bg: 'var(--bg-muted)', border: 'var(--border)', label: 'Expirada' },
  };
  const c = config[status] ?? config.pending;
  return (
    <span style={{
      fontSize: '0.6875rem',
      color: c.color,
      background: c.bg,
      border: `0.5px solid ${c.border}`,
      padding: '0.25rem 0.5rem',
      borderRadius: '999px',
      whiteSpace: 'nowrap',
      fontWeight: 500,
    }}>
      {c.label}
    </span>
  );
}
