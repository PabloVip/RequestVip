'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLiveRequests } from '@/lib/use-live-requests';
import ThemeToggle from '@/components/theme-toggle';

interface Props {
  sessionId: string;
  djName: string;
  venue: string | null;
  initialAccepting: boolean;
}

export default function DjDashboard({ sessionId, djName, venue }: Props) {
  const { requests, loading } = useLiveRequests(sessionId);

  const pending  = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
  const accepted = useMemo(() => requests.filter(r => r.status === 'accepted'), [requests]);

  const respond = async (id: string, action: 'accept' | 'reject' | 'mark_played') => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
  };

  return (
    <main style={{
      minHeight: '100vh',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin" style={{
            color: 'var(--fg-subtle)',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}>
            ←
          </Link>
          <div>
            <h1 style={{
              fontSize: '1.375rem',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}>
              {djName}
            </h1>
            <p style={{ color: 'var(--fg-subtle)', fontSize: '0.8125rem' }}>
              {venue ?? 'Sesión activa'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'var(--accent-soft)',
            color: 'var(--accent-soft-fg)',
            padding: '0.375rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            border: '0.5px solid var(--accent-border)',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              background: 'var(--accent)',
              borderRadius: '50%',
            }} />
            En vivo
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        <Stat label="Pendientes" value={pending.length} />
        <Stat label="Aceptadas" value={accepted.length} />
        <Stat label="Total" value={requests.length} />
      </div>

      {loading && (
        <p style={{
          color: 'var(--fg-subtle)',
          textAlign: 'center',
          padding: '2rem',
        }}>
          Cargando...
        </p>
      )}

      {!loading && pending.length === 0 && (
        <p style={{
          color: 'var(--fg-subtle)',
          textAlign: 'center',
          padding: '2.5rem',
          background: 'var(--bg-subtle)',
          border: '0.5px solid var(--border-subtle)',
          borderRadius: '12px',
          fontSize: '0.9375rem',
        }}>
          Aún no hay peticiones nuevas
        </p>
      )}

      {pending.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={sectionLabelStyle}>
            Peticiones nuevas ({pending.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pending.map(req => (
              <RequestCard
                key={req.id}
                request={req}
                onAccept={() => respond(req.id, 'accept')}
                onReject={() => respond(req.id, 'reject')}
              />
            ))}
          </div>
        </section>
      )}

      {accepted.length > 0 && (
        <section>
          <h2 style={sectionLabelStyle}>
            Cola ({accepted.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {accepted.map(req => (
              <div key={req.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                background: 'var(--accent-bg)',
                border: '0.5px solid var(--accent-border)',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
              }}>
                <Cover url={req.album_art_url} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}>
                    {req.title}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--fg-subtle)' }}>
                    {req.artist}
                    {req.bpm && ` · ${req.bpm} BPM`}
                  </p>
                </div>
                <button
                  onClick={() => respond(req.id, 'mark_played')}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent-soft-fg)',
                    border: '0.5px solid var(--accent-border)',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                  }}
                >
                  Marcar sonada
                </button>
              </div>
            ))}
          </div>
        </section>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '0.5px solid var(--border-subtle)',
      padding: '0.875rem 1rem',
      borderRadius: '10px',
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--fg-subtle)' }}>{label}</p>
      <p style={{
        fontSize: '1.625rem',
        fontWeight: 500,
        marginTop: '0.25rem',
        letterSpacing: '-0.02em',
      }}>
        {value}
      </p>
    </div>
  );
}

function Cover({ url }: { url: string | null }) {
  return (
    <div style={{
      width: '44px',
      height: '44px',
      background: 'var(--bg-muted)',
      borderRadius: '6px',
      flexShrink: 0,
      backgroundImage: url ? `url(${url})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }} />
  );
}

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    artist: string;
    album_art_url: string | null;
    bpm: number | null;
    key_signature: string | null;
    created_at: string;
  };
  onAccept: () => void;
  onReject: () => void;
}

function RequestCard({ request, onAccept, onReject }: RequestCardProps) {
  const ago = timeAgo(request.created_at);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      background: 'var(--bg-subtle)',
      border: '0.5px solid var(--border-subtle)',
      padding: '0.875rem 1rem',
      borderRadius: '10px',
    }}>
      <Cover url={request.album_art_url} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.9375rem',
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          {request.title}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--fg-subtle)' }}>
          {request.artist}
          {request.bpm && ` · ${request.bpm} BPM`}
          {request.key_signature && ` · ${request.key_signature}`}
        </p>
        <p style={{
          fontSize: '0.6875rem',
          color: 'var(--fg-faint)',
          marginTop: '0.125rem',
        }}>
          {ago}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button
          onClick={onAccept}
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          Aceptar
        </button>
        <button
          onClick={onReject}
          style={{
            background: 'transparent',
            color: 'var(--fg-subtle)',
            border: '0.5px solid var(--border)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
          }}
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours} h`;
}
