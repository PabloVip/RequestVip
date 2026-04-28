const DEEZER_SEARCH = 'https://api.deezer.com/search';
const DEEZER_TRACK  = 'https://api.deezer.com/track';

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  albumArtUrl: string | null;
  explicit: boolean;
  preview: string | null;
}

export interface AudioFeatures {
  bpm: number | null;
  key: string | null;
  energy: number | null;
}

export async function searchTracks(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const url = `${DEEZER_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}&output=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Deezer search failed: ${res.status}`);
  const data = await res.json();
  if (!data.data) return [];
  return data.data.map((t: any) => ({
    id: String(t.id),
    title: t.title,
    artist: t.artist?.name ?? '',
    album: t.album?.title ?? '',
    durationMs: (t.duration ?? 0) * 1000,
    albumArtUrl: t.album?.cover_medium ?? null,
    explicit: t.explicit_lyrics ?? false,
    preview: t.preview ?? null,
  }));
}

export async function getAudioFeatures(trackId: string): Promise<AudioFeatures> {
  try {
    const res = await fetch(`${DEEZER_TRACK}/${trackId}`);
    if (!res.ok) return { bpm: null, key: null, energy: null };
    const t = await res.json();
    return {
      bpm: t.bpm && t.bpm > 0 ? Math.round(t.bpm * 10) / 10 : null,
      key: null,
      energy: null,
    };
  } catch {
    return { bpm: null, key: null, energy: null };
  }
}
