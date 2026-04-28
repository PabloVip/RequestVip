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
}

export default function SearchStep({ sessionId, onRequested }: Props) {
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al pedir la canción');
        return;
      }
      onRequested(data.id);
    } catch (e) {
      setError('No se pudo conectar');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar canción o artista"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        style={{
          width: '100%',
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
          padding: '0.875rem 1rem',
          borderRadius: '8px',
          fontSize: '1rem',
          marginBottom: '1rem',
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

      {loading && (
        <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>Buscando...</p>
      )}

      {!loading && tracks.length === 0 && query && (
        <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
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
              background: requesting === track.id ? '#222' : '#1a1a1a',
              border: '1px solid #2a2a2a',
              padding: '0.75rem',
              borderRadius: '8px',
              textAlign: 'left',
              color: '#fff',
              opacity: requesting !== null && requesting !== track.id ? 0.5 : 1,
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#2a2a2a',
              borderRadius: '4px',
              flexShrink: 0,
              backgroundImage: track.albumArtUrl ? `url(${track.albumArtUrl})` : undefined,
              backgroundSize: 'cover',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {track.title}
              </p>
              <p style={{
                fontSize: '0.8125rem',
                color: '#888',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {track.artist}
              </p>
            </div>
            {requesting === track.id && (
              <span style={{ fontSize: '0.75rem', color: '#888' }}>Pidiendo...</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
