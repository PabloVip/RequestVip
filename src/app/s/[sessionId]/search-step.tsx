'use client';

import { useEffect, useRef, useState } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  albumArtUrl: string | null;
  explicit: boolean;
}

interface Props {
  sessionId: string;
  onRequested: (id: string) => void;
  onSessionEnded?: () => void;
}

export default function SearchStep({ sessionId, onRequested, onSessionEnded }: Props) {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setTracks([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setTracks(data.tracks ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const requestTrack = async (track: Track) => {
    setRequesting(track.id);
    setError(null);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          spotify_track_id: track.id,
          title: track.title,
          artist: track.artist,
          album_art_url: track.albumArtUrl,
          duration_ms: track.durationMs,
          explicit: track.explicit,
        }),
      });

      if (res.status === 404 || res.status === 423) {
        if (onSessionEnded) onSessionEnded();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al pedir la canción');
        return;
      }
      onRequested(data.id);
    } catch {
      setError('No se pudo conectar');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar canción o artista"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        style={{ marginBottom: '1rem' }}
      />

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          color: 'var(--danger-fg)',
          border: '0.5px solid var(--danger-border)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {loading && (
        <p style={{ color: 'var(--fg-subtle)', textAlign: 'center', padding: '1rem', fontSize: '0.875rem' }}>
          Buscando...
        </p>
      )}

      {!loading && tracks.length === 0 && query && (
        <p style={{ color: 'var(--fg-subtle)', textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>
          No se encontraron resultados
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => requestTrack(track)}
            disabled={requesting !== null}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: requesting === track.id ? 'var(--accent-bg)' : 'var(--bg-subtle)',
              border: `0.5px solid ${requesting === track.id ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
              padding: '0.625rem 0.75rem',
              borderRadius: '10px',
              textAlign: 'left',
              color: 'var(--fg)',
              opacity: requesting !== null && requesting !== track.id ? 0.5 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              background: 'var(--bg-muted)',
              borderRadius: '6px',
              flexShrink: 0,
              backgroundImage: track.albumArtUrl ? `url(${track.albumArtUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.01em',
              }}>
                {track.title}
              </p>
              <p style={{
                fontSize: '0.8125rem',
                color: 'var(--fg-subtle)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {track.artist}
              </p>
            </div>
            {requesting === track.id && (
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--accent-soft-fg)',
                fontWeight: 500,
              }}>
                Pidiendo...
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
