import { NextRequest, NextResponse } from 'next/server';
import { searchTracks } from '@/lib/spotify';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ tracks: [] });
  if (q.length > 100) {
    return NextResponse.json({ error: 'Query too long' }, { status: 400 });
  }
  try {
    const tracks = await searchTracks(q, 8);
    return NextResponse.json({ tracks });
  } catch (e) {
    return NextResponse.json({ error: 'Search failed' }, { status: 502 });
  }
}
