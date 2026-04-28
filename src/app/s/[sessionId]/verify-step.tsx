'use client';

import { useState } from 'react';

interface Props {
  sessionId: string;
  djInstagram: string;
  igPostCode: string | null;
  onVerified: () => void;
}

export default function VerifyStep({ sessionId, djInstagram, onVerified }: Props) {
  const [followed, setFollowed] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const handleFollow = () => {
    window.open(`https://instagram.com/${djInstagram}`, '_blank');
    setFollowed(true);
  };

  const handleContinue = async () => {
    setContinuing(true);
    try {
      const res = await fetch('/api/attendee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (res.ok) onVerified();
    } catch {
      setContinuing(false);
    }
  };

  return (
    <div>
      <div style={{
        background: 'var(--bg-subtle)',
        border: '0.5px solid var(--border-subtle)',
        padding: '2rem 1.5rem',
        borderRadius: '14px',
        marginBottom: '1rem',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'var(--fg-muted)',
          fontSize: '0.9375rem',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}>
          Para pedir canciones,<br />sigue al DJ en Instagram
        </p>

        <button
          onClick={handleFollow}
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            padding: '0.875rem 1.75rem',
            borderRadius: '10px',
            fontWeight: 500,
            border: 'none',
            fontSize: '0.9375rem',
            marginBottom: '0.75rem',
          }}
        >
          Seguir a @{djInstagram}
        </button>

        <p style={{
          color: 'var(--fg-faint)',
          fontSize: '0.75rem',
        }}>
          Se abrirá Instagram en otra pestaña
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={continuing}
        style={{
          width: '100%',
          background: followed ? 'var(--accent)' : 'var(--bg-muted)',
          color: followed ? 'var(--accent-fg)' : 'var(--fg)',
          border: followed ? 'none' : '0.5px solid var(--border)',
          padding: '0.875rem',
          borderRadius: '10px',
          fontSize: '0.9375rem',
          fontWeight: 500,
        }}
      >
        {continuing ? 'Entrando...' : 'Ya le sigo, continuar'}
      </button>
    </div>
  );
}
