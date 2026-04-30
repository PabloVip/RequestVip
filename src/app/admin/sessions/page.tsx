import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';
import ThemeToggle from '@/components/theme-toggle';
import DeleteAllButton from './delete-all-button';

export default async function SessionsPage() {
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

  const { data: sessions } = await service
    .from('sessions')
    .select('id, venue, status, started_at, ended_at')
    .eq('dj_id', dj.id)
    .order('started_at', { ascending: false });

  const sessionsWithStats: Array<{
    id: string;
    venue: string | null;
    status: string;
    started_at: string;
    ended_at: string | null;
    total: number;
    accepted: number;
  }> = [];

  if (sessions && sessions.length > 0) {
    const ids = sessions.map(s => s.id);
    const { data: requests } = await service
      .from('song_requests')
      .select('session_id, status')
      .in('session_id', ids);

    for (const session of sessions) {
      const sessReqs = requests?.filter(r => r.session_id === session.id) ?? [];
      sessionsWithStats.push({
        ...session,
        total: sessReqs.length,
        accepted: sessReqs.filter(r => r.status === 'accepted' || r.status === 'played').length,
      });
    }
  }

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
        <Link href="/admin" style={{
          color: 'var(--fg-subtle)',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}>
          ← Volver
        </Link>
        <ThemeToggle />
      </div>

      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginBottom: '0.5rem',
      }}>
        Historial de sesiones
      </h1>
      <p style={{
        color: 'var(--fg-subtle)',
        fontSize: '0.9375rem',
        marginBottom: '2rem',
      }}>
        Todas las sesiones que has realizado.
      </p>

      {sessionsWithStats.length === 0 && (
        <div style={{
          background: 'var(--bg-subtle)',
          border: '0.5px solid var(--border-subtle)',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'var(--fg-subtle)',
        }}>
          Aún no tienes sesiones. Crea una desde el panel principal.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {sessionsWithStats.map(session => (
          <Link
            key={session.id}
            href={`/admin/sessions/${session.id}`}
            style={{
              background: 'var(--bg-subtle)',
              border: '0.5px solid var(--border-subtle)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'var(--fg)',
              display: 'block',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  marginBottom: '0.25rem',
                  letterSpacing: '-0.01em',
                }}>
                  {session.venue ?? 'Sesión sin nombre'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--fg-subtle)' }}>
                  {new Date(session.started_at).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span style={{
                fontSize: '0.6875rem',
                color: session.status === 'active' ? 'var(--accent-soft-fg)' : 'var(--fg-subtle)',
                background: session.status === 'active' ? 'var(--accent-soft)' : 'var(--bg-muted)',
                border: `0.5px solid ${session.status === 'active' ? 'var(--accent-border)' : 'var(--border)'}`,
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                marginLeft: '0.5rem',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}>
                {session.status === 'active' ? 'En vivo' : 'Terminada'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--fg-subtle)',
            }}>
              <span>
                <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{session.total}</strong>{' '}
                peticiones
              </span>
              <span>
                <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{session.accepted}</strong>{' '}
                aceptadas
              </span>
              {session.total > 0 && (
                <span>
                  {Math.round((session.accepted / session.total) * 100)}% aceptación
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {sessionsWithStats.length > 0 && (
        <DeleteAllButton sessionCount={sessionsWithStats.length} />
      )}
    </main>
  );
}
