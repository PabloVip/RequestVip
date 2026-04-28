'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import ThemeToggle from '@/components/theme-toggle';

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
      maxWidth: '720px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}>
            {djName}
          </h1>
          <p style={{ color: 'var(--fg-subtle)', fontSize: '0.875rem', marginTop: '0.125rem' }}>
            @{djInstagram}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/admin/preferences" style={navButtonStyle}>Preferencias</Link>
          <Link href="/admin/profile" style={navButtonStyle}>Perfil</Link>
          <ThemeToggle />
          <button onClick={handleSignOut} style={{
            ...navButtonStyle,
            background: 'transparent',
            color: 'var(--fg-subtle)',
          }}>
            Salir
          </button>
        </div>
      </header>

      {globalStats.totalSessions > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={sectionLabelStyle}>Tu actividad</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
          }}>
            <GlobalStat label="Sesiones" value={globalStats.totalSessions} />
            <GlobalStat label="Peticiones" value={globalStats.totalRequests} />
            <GlobalStat
              label="Aceptación"
              value={globalStats.acceptanceRate !== null ? `${globalStats.acceptanceRate}%` : '—'}
              accent
            />
          </div>
          <Link href="/admin/sessions" style={{
            display: 'block',
            marginTop: '0.75rem',
            color: 'var(--fg-subtle)',
            fontSize: '0.875rem',
            textAlign: 'center',
            textDecoration: 'none',
          }}>
            Ver historial →
          </Link>
        </section>
      )}

      {activeSession ? (
        <section>
          <div style={{
            background: 'var(--accent-bg)',
            border: '0.5px solid var(--accent-border)',
            padding: '1.5rem',
            borderRadius: '14px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.25rem',
            }}>
              <div>
                <p style={{
                  fontSize: '0.6875rem',
                  color: 'var(--accent-soft-fg)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                }}>
                  Sesión activa
                </p>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  marginTop: '0.25rem',
                  letterSpacing: '-0.02em',
                }}>
                  {activeSession.venue ?? 'Sesión sin nombre'}
                </p>
                <p style={{
                  fontSize: '0.8125rem',
                  color: 'var(--fg-subtle)',
                  marginTop: '0.25rem',
                }}>
                  {new Date(activeSession.started_at).toLocaleString('es-ES')}
                </p>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: activeSession.accepting ? 'var(--accent-soft)' : 'var(--warning-bg)',
                color: activeSession.accepting ? 'var(--accent-soft-fg)' : 'var(--warning-fg)',
                padding: '0.375rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: `0.5px solid ${activeSession.accepting ? 'var(--accent-border)' : 'var(--warning-border)'}`,
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  background: activeSession.accepting ? 'var(--accent)' : 'var(--warning-fg)',
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
                marginBottom: '1.25rem',
              }}>
                <Stat label="Pendientes" value={stats.pending} />
                <Stat label="Aceptadas" value={stats.accepted} />
                <Stat label="Sonadas" value={stats.played} />
                <Stat label="Total" value={stats.total} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href={`/dj/${activeSession.id}`} style={primaryLinkStyle}>
                Abrir dashboard de peticiones
              </Link>
              <Link href={`/qr/${activeSession.id}`} target="_blank" style={secondaryLinkStyle}>
                Ver código QR
              </Link>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleToggleAccepting} style={{
                  ...secondaryButtonStyle,
                  flex: 1,
                }}>
                  {activeSession.accepting ? 'Pausar' : 'Reanudar'}
                </button>
                <button onClick={handleEndSession} style={{
                  ...secondaryButtonStyle,
                  flex: 1,
                  color: 'var(--danger-fg)',
                  borderColor: 'var(--danger-border)',
                }}>
                  Terminar sesión
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div style={{
            background: 'var(--bg-subtle)',
            border: '0.5px solid var(--border)',
            padding: '1.5rem',
            borderRadius: '14px',
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              marginBottom: '0.375rem',
              letterSpacing: '-0.01em',
            }}>
              Empezar una sesión
            </h2>
            <p style={{
              color: 'var(--fg-subtle)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
            }}>
              Crea una sesión para empezar a recibir peticiones de canciones.
            </p>

            <form onSubmit={handleCreateSession}>
              <input
                type="text"
                placeholder="Nombre del local (opcional)"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />

              {error && <div style={errorBoxStyle}>{error}</div>}

              <button type="submit" disabled={creating} style={primaryButtonStyle}>
                {creating ? 'Creando...' : 'Empezar sesión'}
              </button>
            </form>
          </div>
        </section>
      )}

      <p style={{
        color: 'var(--fg-faint)',
        fontSize: '0.75rem',
        textAlign: 'center',
        marginTop: '2.5rem',
      }}>
        Conectado como {userEmail}
      </p>
    </main>
  );
}

const navButtonStyle: React.CSSProperties = {
  background: 'var(--bg-muted)',
  color: 'var(--fg)',
  border: '0.5px solid var(--border)',
  padding: '0.5rem 0.875rem',
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 500,
  textDecoration: 'none',
  height: '34px',
  display: 'inline-flex',
  alignItems: 'center',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--fg-subtle)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.625rem',
  fontWeight: 500,
};

const errorBoxStyle: React.CSSProperties = {
  background: 'var(--danger-bg)',
  color: 'var(--danger-fg)',
  border: '0.5px solid var(--danger-border)',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  marginBottom: '1rem',
  fontSize: '0.875rem',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--accent)',
  color: 'var(--accent-fg)',
  border: 'none',
  padding: '0.875rem',
  borderRadius: '8px',
  fontSize: '0.9375rem',
  fontWeight: 500,
};

const primaryLinkStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  display: 'block',
  textAlign: 'center',
  textDecoration: 'none',
};

const secondaryButtonStyle: React.CSSProperties = {
  background: 'var(--bg)',
  color: 'var(--fg)',
  border: '0.5px solid var(--border)',
  padding: '0.75rem',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const secondaryLinkStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  display: 'block',
  textAlign: 'center',
  textDecoration: 'none',
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'var(--bg)',
      borderRadius: '8px',
      padding: '0.625rem 0.75rem',
    }}>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg-subtle)' }}>{label}</p>
      <p style={{
        fontSize: '1.25rem',
        fontWeight: 500,
        marginTop: '0.125rem',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </p>
    </div>
  );
}

function GlobalStat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
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
