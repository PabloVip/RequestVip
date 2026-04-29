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
      body: JSON.stringify({ action: activeSession.accepting ? 'pause' : 'resume' }),
    });
    router.refresh();
  };

  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '720px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        gap: '0.75rem',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {djName}
          </h1>
          <p style={{
            color: 'var(--fg-subtle)',
            fontSize: '0.875rem',
            marginTop: '0.125rem',
          }}>
            @{djInstagram}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexShrink: 0 }}>
          <Link href="/admin/preferences" style={iconButtonStyle} aria-label="Preferencias">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <Link href="/admin/profile" style={iconButtonStyle} aria-label="Perfil">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <ThemeToggle />
          <button onClick={handleSignOut} style={iconButtonStyle} aria-label="Salir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {globalStats.totalSessions > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={sectionLabelStyle}>Tu actividad</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <GlobalStat label="Sesiones" value={globalStats.totalSessions} />
            <GlobalStat label="Peticiones" value={globalStats.totalRequests} />
            <GlobalStat label="Aceptación" value={globalStats.acceptanceRate !== null ? `${globalStats.acceptanceRate}%` : '—'} accent />
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
            padding: '1.25rem',
            borderRadius: '14px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.25rem',
              gap: '0.75rem',
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
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
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  marginTop: '0.25rem',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {activeSession.venue ?? 'Sesión sin nombre'}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--fg-subtle)',
                  marginTop: '0.25rem',
                }}>
                  {new Date(activeSession.started_at).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: activeSession.accepting ? 'var(--accent-soft)' : 'var(--warning-bg)',
                color: activeSession.accepting ? 'var(--accent-soft-fg)' : 'var(--warning-fg)',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 500,
                border: `0.5px solid ${activeSession.accepting ? 'var(--accent-border)' : 'var(--warning-border)'}`,
                flexShrink: 0,
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
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
                gap: '0.375rem',
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
                Abrir dashboard
              </Link>
              <Link href={`/qr/${activeSession.id}`} target="_blank" style={secondaryLinkStyle}>
                Ver código QR
              </Link>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleToggleAccepting} style={{ ...secondaryButtonStyle, flex: 1 }}>
                  {activeSession.accepting ? 'Pausar' : 'Reanudar'}
                </button>
                <button onClick={handleEndSession} style={{
                  ...secondaryButtonStyle,
                  flex: 1,
                  color: 'var(--danger-fg)',
                  borderColor: 'var(--danger-border)',
                }}>
                  Terminar
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
            padding: '1.25rem',
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
        wordBreak: 'break-all',
      }}>
        {userEmail}
      </p>
    </main>
  );
}

const iconButtonStyle: React.CSSProperties = {
  background: 'var(--bg-muted)',
  color: 'var(--fg)',
  border: '0.5px solid var(--border)',
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  padding: 0,
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
    <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.5rem 0.625rem' }}>
      <p style={{ fontSize: '0.625rem', color: 'var(--fg-subtle)' }}>{label}</p>
      <p style={{
        fontSize: '1.125rem',
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
      padding: '0.75rem',
      borderRadius: '10px',
    }}>
      <p style={{ fontSize: '0.6875rem', color: 'var(--fg-subtle)' }}>{label}</p>
      <p style={{
        fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
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
