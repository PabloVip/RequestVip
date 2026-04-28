'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

interface ActiveSession {
  id: string;
  venue: string | null;
  qr_token: string;
  accepting: boolean;
  started_at: string;
}

interface Stats {
  pending: number;
  accepted: number;
  played: number;
  total: number;
}

interface GlobalStats {
  totalSessions: number;
  totalRequests: number;
  acceptanceRate: number | null;
}

interface Props {
  djName: string;
  djInstagram: string;
  activeSession: ActiveSession | null;
  stats: Stats | null;
  userEmail: string;
  globalStats: GlobalStats;
}

export default function AdminClient({
  djName,
  djInstagram,
  activeSession,
  stats,
  userEmail,
  globalStats,
}: Props) {
  const router = useRouter();
  const [venue, setVenue] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venue: venue.trim() || null }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Error al crear sesión');
      setCreating(false);
      return;
    }

    router.refresh();
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    if (!confirm('¿Terminar esta sesión? Ya no podrás recibir peticiones.')) return;

    await fetch(`/api/sessions/${activeSession.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end' }),
    });
    router.refresh();
  };

  const handleToggleAccepting = async () => {
    if (!activeSession) return;
    await fetch(`/api/sessions/${activeSession.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: activeSession.accepting ? 'pause' : 'resume',
      }),
    });
    router.refresh();
  };

  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '1.5rem',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #222',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{djName}</h1>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>@{djInstagram}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/admin/preferences"
            style={navLink}
          >
            Preferencias
          </Link>
          <Link
            href="/admin/profile"
            style={navLink}
          >
            Perfil
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              color: '#888',
              border: '1px solid #333',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {globalStats.totalSessions > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Tu actividad
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }}>
            <GlobalStat label="Sesiones" value={globalStats.totalSessions} />
            <GlobalStat label="Peticiones" value={globalStats.totalRequests} />
            <GlobalStat label="Aceptación" value={globalStats.acceptanceRate !== null ? `${globalStats.acceptanceRate}%` : '—'} />
          </div>
          <Link
            href="/admin/sessions"
            style={{
              display: 'block',
              marginTop: '0.75rem',
              color: '#888',
              fontSize: '0.875rem',
              textAlign: 'center',
              textDecoration: 'underline',
            }}
          >
            Ver historial de sesiones →
          </Link>
        </section>
      )}

      {activeSession ? (
        <section>
          <div style={{
            background: '#0a3320',
            border: '1px solid #1a5a3a',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Sesión activa
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 500, marginTop: '0.25rem' }}>
                  {activeSession.venue ?? 'Sesión sin nombre'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#888', marginTop: '0.25rem' }}>
                  Iniciada {new Date(activeSession.started_at).toLocaleString('es-ES')}
                </p>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: activeSession.accepting ? '#0a3320' : '#3a2a00',
                color: activeSession.accepting ? '#34d399' : '#fbbf24',
                padding: '0.375rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: `1px solid ${activeSession.accepting ? '#1a5a3a' : '#5a4a00'}`,
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  background: activeSession.accepting ? '#34d399' : '#fbbf24',
                  borderRadius: '50%',
                }} />
                {activeSession.accepting ? 'Aceptando' : 'Pausada'}
              </span>
            </div>

            {stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}>
                <Stat label="Pendientes" value={stats.pending} />
                <Stat label="Aceptadas" value={stats.accepted} />
                <Stat label="Sonadas" value={stats.played} />
                <Stat label="Total" value={stats.total} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href={`/dj/${activeSession.id}`}
                style={{
                  background: '#fff',
                  color: '#000',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Abrir dashboard de peticiones
              </Link>
              <Link
                href={`/qr/${activeSession.id}`}
                target="_blank"
                style={{
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Ver código QR
              </Link>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleToggleAccepting}
                  style={{
                    flex: 1,
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid #333',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                >
                  {activeSession.accepting ? 'Pausar peticiones' : 'Reanudar'}
                </button>
                <button
                  onClick={handleEndSession}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#f87171',
                    border: '1px solid #5a1a1a',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                >
                  Terminar sesión
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            padding: '1.5rem',
            borderRadius: '12px',
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Empezar una sesión
            </h2>
            <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Crea una sesión para empezar a recibir peticiones de canciones.
            </p>

            <form onSubmit={handleCreateSession}>
              <input
                type="text"
                placeholder="Nombre del local (opcional)"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  color: '#fff',
                  border: '1px solid #333',
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                }}
              />

              {error && (
                <div style={{
                  background: '#3a0a0a',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                style={{
                  width: '100%',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {creating ? 'Creando...' : 'Empezar sesión'}
              </button>
            </form>
          </div>
        </section>
      )}

      <p style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
        Conectado como {userEmail}
      </p>
    </main>
  );
}

const navLink: React.CSSProperties = {
  background: '#1a1a1a',
  color: '#fff',
  border: '1px solid #333',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  fontSize: '0.875rem',
  textDecoration: 'none',
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.625rem 0.5rem', borderRadius: '6px' }}>
      <p style={{ fontSize: '0.6875rem', color: '#888' }}>{label}</p>
      <p style={{ fontSize: '1.25rem', fontWeight: 500, marginTop: '0.125rem' }}>{value}</p>
    </div>
  );
}

function GlobalStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '0.75rem', borderRadius: '8px' }}>
      <p style={{ fontSize: '0.75rem', color: '#888' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 500, marginTop: '0.125rem' }}>{value}</p>
    </div>
  );
}
