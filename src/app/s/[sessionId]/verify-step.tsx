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
      if (res.ok) {
        onVerified();
      }
    } catch {
      setContinuing(false);
    }
  };

  return (
    <div>
      <div style={{
        background: '#1a1a1a',
        padding: '2rem 1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ color: '#aaa', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
          Para pedir canciones, sigue al DJ en Instagram
        </p>

        <button
          onClick={handleFollow}
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#000',
            padding: '0.875rem 2rem',
            borderRadius: '8px',
            fontWeight: 500,
            border: 'none',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        >
          Seguir a @{djInstagram}
        </button>

        <p style={{ color: '#666', fontSize: '0.8125rem' }}>
          Se abrirá Instagram en otra pestaña
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={continuing}
        style={{
          width: '100%',
          background: followed ? '#fff' : '#1a1a1a',
          color: followed ? '#000' : '#aaa',
          border: followed ? 'none' : '1px solid #333',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        {continuing ? 'Entrando...' : 'Ya le sigo, continuar'}
      </button>
    </div>
  );
}
