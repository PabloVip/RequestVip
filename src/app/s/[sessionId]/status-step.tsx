'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Props {
  requestId: string;
  onAnother: () => void;
}

interface Request {
  id: string;
  title: string;
  artist: string;
  album_art_url: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'played' | 'expired';
  rejection_reason: string | null;
}

export default function StatusStep({ requestId, onAnother }: Props) {
  const [request, setRequest] = useState<Request | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('song_requests')
        .select('id,title,artist,album_art_url,status,rejection_reason')
        .eq('id', requestId)
        .single();
      if (!cancelled && data) setRequest(data as Request);
    })();

    const channel = supabase
      .channel(`request:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'song_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          setRequest(payload.new as Request);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  if (!request) {
    return (
      <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
        Cargando...
      </p>
    );
  }

  const statusConfig = {
    pending:  { color: '#fbbf24', bg: '#3a2a00', label: 'Esperando respuesta del DJ' },
    accepted: { color: '#34d399', bg: '#0a3320', label: '¡Aceptada! El DJ la pondrá pronto' },
    rejected: { color: '#f87171', bg: '#3a0a0a', label: 'Rechazada' },
    played:   { color: '#a78bfa', bg: '#1a0a3a', label: '¡Sonó!' },
    expired:  { color: '#888',    bg: '#222',    label: 'Expiró' },
  };

  const config = statusConfig[request.status];

  return (
    <div>
      <div style={{
        background: '#1a1a1a',
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: '#2a2a2a',
          borderRadius: '8px',
          margin: '0 auto 1rem',
          backgroundImage: request.album_art_url ? `url(${request.album_art_url})` : undefined,
          backgroundSize: 'cover',
        }} />
        <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          {request.title}
        </p>
        <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {request.artist}
        </p>

        <div style={{
          display: 'inline-block',
          background: config.bg,
          color: config.color,
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}>
          {config.label}
        </div>

        {request.status === 'rejected' && request.rejection_reason && (
          <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
            {request.rejection_reason}
          </p>
        )}
      </div>

      {(request.status === 'rejected' || request.status === 'played') && (
        <button
          onClick={onAnother}
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
          Pedir otra canción
        </button>
      )}
    </div>
  );
}
