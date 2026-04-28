import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';

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
      maxWidth: '700px',
      margin: '0 auto',
      padding: '1.5rem',
    }}>
      <Link
        href="/admin"
        style={{ color: '#888', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block' }}
      >
        ← Volver
      </Link>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Historial de sesiones
      </h1>
      <p style={{ color: '#888', fontSize: '0.9375rem', marginBottom: '2rem' }}>
        Todas las sesiones que has realizado.
      </p>

      {sessionsWithStats.length === 0 && (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#888',
        }}>
          Aún no tienes sesiones. Crea una desde el panel principal.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sessionsWithStats.map(session => (
          <Link
            key={session.id}
            href={`/admin/sessions/${session.id}`}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#fff',
              display: 'block',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {session.venue ?? 'Sesión sin nombre'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#888' }}>
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
                color: session.status === 'active' ? '#34d399' : '#666',
                background: session.status === 'active' ? '#0a3320' : '#222',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                marginLeft: '0.5rem',
                whiteSpace: 'nowrap',
              }}>
                {session.status === 'active' ? 'En vivo' : 'Terminada'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.75rem',
              fontSize: '0.8125rem',
              color: '#888',
            }}>
              <span><strong style={{ color: '#fff' }}>{session.total}</strong> peticiones</span>
              <span><strong style={{ color: '#fff' }}>{session.accepted}</strong> aceptadas</span>
              {session.total > 0 && (
                <span>{Math.round((session.accepted / session.total) * 100)}% aceptación</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
