'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Props {
  url: string;
  djName: string;
  djInstagram: string;
  venue: string | null;
}

export default function QRView({ url, djName, djInstagram, venue }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 600,
      margin: 1,
      color: { dark: '#09090b', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setDataUrl);
  }, [url]);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#09090b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Geist, -apple-system, sans-serif',
    }}>
      <p style={{
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#52525b',
        marginBottom: '0.5rem',
        fontWeight: 500,
      }}>
        {venue ?? 'En vivo'}
      </p>

      <h1 style={{
        fontSize: '2.75rem',
        fontWeight: 500,
        marginBottom: '0.25rem',
        letterSpacing: '-0.03em',
      }}>
        {djName}
      </h1>

      <p style={{ color: '#52525b', marginBottom: '2rem' }}>
        @{djInstagram}
      </p>

      {dataUrl && (
        <div style={{
          padding: '1rem',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e4e4e7',
          marginBottom: '1.5rem',
        }}>
          <img
            src={dataUrl}
            alt="QR para pedir canciones"
            style={{
              width: '320px',
              height: '320px',
              display: 'block',
            }}
          />
        </div>
      )}

      <p style={{
        fontSize: '1.25rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
        letterSpacing: '-0.01em',
      }}>
        Escanea para pedir canciones
      </p>

      <p style={{
        fontSize: '0.875rem',
        color: '#52525b',
      }}>
        Sigue al DJ en Instagram y pide la que quieras
      </p>

      <div style={{
        marginTop: '3rem',
        padding: '0.5rem 1rem',
        background: '#faf5ff',
        border: '0.5px solid #d8b4fe',
        color: '#5b21b6',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.05em',
      }}>
        TUNEVIP
      </div>
    </main>
  );
}
