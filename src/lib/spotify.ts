const DEEZER_SEARCH = 'https://api.deezer.com/search';
const DEEZER_TRACK  = 'https://api.deezer.com/track';
const GETSONGBPM_API = 'https://api.getsong.co';

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
  const res = await fetch(url, { next: { revalidate: 0 } });
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
  // 1. Intentar con Deezer primero
  try {
    const res = await fetch(`${DEEZER_TRACK}/${trackId}`, { next: { revalidate: 0 } });
    if (res.ok) {
      const t = await res.json();
      if (t.bpm && t.bpm > 0) {
        return {
          bpm: Math.round(t.bpm * 10) / 10,
          key: null,
          energy: null,
        };
      }
      // Deezer no tiene BPM para esta canción, guardamos título y artista para fallback
      const title = t.title ?? null;
      const artist = t.artist?.name ?? null;
      if (title && artist) {
        return await getFromSongBPM(title, artist);
      }
    }
  } catch {
    // continúa al fallback
  }

  return { bpm: null, key: null, energy: null };
}

async function getFromSongBPM(title: string, artist: string): Promise<AudioFeatures> {
  const apiKey = process.env.GETSONGBPM_API_KEY;
  if (!apiKey) return { bpm: null, key: null, energy: null };

  try {
    const lookup = encodeURIComponent(`${title} ${artist}`);
    const url = `${GETSONGBPM_API}/search/?api_key=${apiKey}&type=song&lookup=${lookup}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return { bpm: null, key: null, energy: null };

    const data = await res.json();
    const song = data.search?.[0];
    if (!song) return { bpm: null, key: null, energy: null };

    const bpm = song.tempo ? Math.round(parseFloat(song.tempo) * 10) / 10 : null;
    const key = song.key_of ?? null;

    return { bpm, key, energy: null };
  } catch {
    return { bpm: null, key: null, energy: null };
  }
}
