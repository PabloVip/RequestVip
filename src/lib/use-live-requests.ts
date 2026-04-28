'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface LiveRequest {
  id: string;
  title: string;
  artist: string;
  album_art_url: string | null;
  bpm: number | null;
  key_signature: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'played' | 'expired';
  created_at: string;
  attendee_id: string;
}

export function useLiveRequests(sessionId: string) {
  const [requests, setRequests] = useState<LiveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('song_requests')
        .select('id,title,artist,album_art_url,bpm,key_signature,status,created_at,attendee_id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });
      if (!cancelled && data) {
        setRequests(data as LiveRequest[]);
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_requests',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setRequests((prev) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new as LiveRequest, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((r) =>
                r.id === (payload.new as LiveRequest).id
                  ? (payload.new as LiveRequest)
                  : r
              );
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((r) => r.id !== (payload.old as LiveRequest).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { requests, loading };
}
