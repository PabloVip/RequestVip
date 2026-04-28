'use client';

import { useMemo } from 'react';
import { useLiveRequests } from '@/lib/use-live-requests';

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
  const recent   = useMemo(
    () => requests.filter(r => r.status === 'rejected' || r.status === 'played').slice(0, 5),
    [requests]
  );

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
          <p style={{ color: '#888', fontSize: '0.875rem' }}>{venue ?? 'Sesión activa'}</p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#0a3320',
          color: '#34d399',
          padding: '0.375rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.875rem',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: '#34d399',
            borderRadius: '50%',
          }} />
          En vivo
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
        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Cargando...</p>
      )}

      {!loading && pending.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', padding: '2rem', background: '#1a1a1a', borderRadius: '12px' }}>
          Aún no hay peticiones nuevas
        </p>
      )}

      {pending.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Peticiones nuevas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pending.map(req => (
              <RequestCard key={req.id} request={req} onAccept={() => respond(req.id, 'accept')} onReject={() => respond(req.id, 'reject')} />
            ))}
          </div>
        </section>
      )}

      {accepted.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Cola
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {accepted.map(req => (
              <div key={req.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#0a1f15',
                border: '1px solid #1a3a2a',
                padding: '0.75rem',
                borderRadius: '8px',
              }}>
                <Cover url={req.album_art_url} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{req.title}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#888' }}>
                    {req.artist}
                    {req.bpm && ` · ${req.bpm} BPM`}
                  </p>
                </div>
                <button
                  onClick={() => respond(req.id, 'mark_played')}
                  style={{
                    background: 'transparent',
                    color: '#a78bfa',
                    border: '1px solid #2a1a4a',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                  }}
                >
                  Marcar como sonada
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
      <p style={{ fontSize: '0.75rem', color: '#888' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 600, marginTop: '0.25rem' }}>{value}</p>
    </div>
  );
}

function Cover({ url }: { url: string | null }) {
  return (
    <div style={{
      width: '48px',
      height: '48px',
      background: '#2a2a2a',
      borderRadius: '4px',
      flexShrink: 0,
      backgroundImage: url ? `url(${url})` : undefined,
      backgroundSize: 'cover',
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
      gap: '0.75rem',
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      padding: '0.875rem',
      borderRadius: '8px',
    }}>
      <Cover url={request.album_art_url} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{request.title}</p>
        <p style={{ fontSize: '0.8125rem', color: '#888' }}>
          {request.artist}
          {request.bpm && ` · ${request.bpm} BPM`}
          {request.key_signature && ` · ${request.key_signature}`}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.125rem' }}>{ago}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button
          onClick={onAccept}
          style={{
            background: '#0a3320',
            color: '#34d399',
            border: '1px solid #1a5a3a',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Aceptar
        </button>
        <button
          onClick={onReject}
          style={{
            background: 'transparent',
            color: '#888',
            border: '1px solid #333',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
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
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `hace ${hours}h`;
}
