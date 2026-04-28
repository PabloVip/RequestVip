'use client';

import { useEffect, useRef, useState } from 'react';
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

const STORAGE_KEY = 'tunedrop_notifications';

export default function StatusStep({ requestId, onAnother }: Props) {
  const [request, setRequest] = useState<Request | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const lastStatusRef = useRef<string | null>(null);
  const audioRef = useRef<{ accept: HTMLAudioElement | null; reject: HTMLAudioElement | null }>({
    accept: null,
    reject: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setNotificationsOn(stored === '1');

    audioRef.current.accept = createTone(660, 0.15, 'sine');
    audioRef.current.reject = createTone(220, 0.2, 'sine');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, notificationsOn ? '1' : '0');
    }
  }, [notificationsOn]);

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
      if (!cancelled && data) {
        setRequest(data as Request);
        lastStatusRef.current = data.status;
      }
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
          const next = payload.new as Request;
          const prevStatus = lastStatusRef.current;
          setRequest(next);

          if (prevStatus && prevStatus !== next.status) {
            handleStatusChange(prevStatus, next.status);
          }
          lastStatusRef.current = next.status;
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const handleStatusChange = (_prev: string, next: string) => {
    if (!notificationsOn) return;

    if (next === 'accepted') {
      showToast('¡Tu canción fue aceptada!', 'success');
      playSound('accept');
      vibrate([100, 50, 100]);
    } else if (next === 'rejected') {
      showToast('Tu petición fue rechazada', 'error');
      playSound('reject');
      vibrate([200]);
    } else if (next === 'played') {
      showToast('¡Tu canción está sonando!', 'success');
      playSound('accept');
      vibrate([100, 50, 100, 50, 100]);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const playSound = (kind: 'accept' | 'reject') => {
    try {
      audioRef.current[kind]?.play().catch(() => {});
    } catch {}
  };

  const vibrate = (pattern: number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch {}
    }
  };

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
      {toast && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          maxWidth: '480px',
          margin: '0 auto',
          background: toast.type === 'success' ? '#0a3320' : toast.type === 'error' ? '#3a0a0a' : '#1a1a1a',
          color: toast.type === 'success' ? '#34d399' : toast.type === 'error' ? '#f87171' : '#fff',
          border: `1px solid ${toast.type === 'success' ? '#1a5a3a' : toast.type === 'error' ? '#5a1a1a' : '#333'}`,
          padding: '0.875rem 1rem',
          borderRadius: '12px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          textAlign: 'center',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '0.75rem',
      }}>
        <button
          onClick={() => setNotificationsOn(!notificationsOn)}
          aria-label={notificationsOn ? 'Desactivar notificaciones' : 'Activar notificaciones'}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: notificationsOn ? '#fff' : '#666',
            padding: '0.375rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <span style={{ fontSize: '0.875rem' }}>{notificationsOn ? '🔔' : '🔕'}</span>
          {notificationsOn ? 'Notificaciones' : 'Silenciado'}
        </button>
      </div>

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

function createTone(frequency: number, duration: number, type: OscillatorType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const fade = Math.min(1, (length - i) / (sampleRate * 0.05));
      let sample = 0;
      if (type === 'sine') sample = Math.sin(2 * Math.PI * frequency * t);
      else if (type === 'square') sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
      data[i] = sample * 0.3 * fade;
    }

    const offlineCtx = new OfflineAudioContext(1, length, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    const audio = new Audio();
    offlineCtx.startRendering().then(rendered => {
      const wavData = audioBufferToWav(rendered);
      const blob = new Blob([wavData], { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
    });
    return audio;
  } catch {
    return null;
  }
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const data = buffer.getChannelData(0);
  let offset = 0;

  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };

  writeString('RIFF');
  view.setUint32(offset, length - 8, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true);  offset += 2;
  view.setUint16(offset, 1, true);  offset += 2;
  view.setUint32(offset, buffer.sampleRate, true); offset += 4;
  view.setUint32(offset, buffer.sampleRate * 2, true); offset += 4;
  view.setUint16(offset, 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString('data');
  view.setUint32(offset, buffer.length * 2, true); offset += 4;

  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return arrayBuffer;
}
